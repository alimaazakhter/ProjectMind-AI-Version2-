import { randomUUID } from 'crypto';

/**
 * In-memory async job store for long-running blueprint generation.
 *
 * WHY: a full multi-agent generation can take 90–200s. Render (and most PaaS edges)
 * cut off any single HTTP request after ~100s, so a synchronous generate call returns
 * a 502 even though the work is fine. Instead we start the job, return a jobId
 * immediately, run generation in the background, and let the client poll for the
 * result — no single request is ever held long enough to trip the edge timeout.
 *
 * The store is per-instance and non-persistent (fine for a single free web service);
 * completed jobs are auto-evicted after a TTL so memory stays bounded.
 */

export type JobStatus = 'processing' | 'completed' | 'failed';

export interface GenerationJob {
  id: string;
  userId: string;
  status: JobStatus;
  result?: any;        // persisted ProjectBlueprint on success
  error?: string;      // human-readable message on failure
  errorStatus?: number; // upstream status (e.g. 429 rate-limited)
  createdAt: number;
  updatedAt: number;
}

const jobs = new Map<string, GenerationJob>();

// Keep finished jobs around long enough for the client to read the result, then evict.
const COMPLETED_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_JOB_AGE_MS = 30 * 60 * 1000;   // hard cap for any job

function sweep(): void {
  const now = Date.now();
  for (const [id, job] of jobs) {
    const age = now - job.createdAt;
    const settled = job.status !== 'processing';
    if (age > MAX_JOB_AGE_MS || (settled && now - job.updatedAt > COMPLETED_TTL_MS)) {
      jobs.delete(id);
    }
  }
}

export const JobStore = {
  create(userId: string): GenerationJob {
    sweep();
    const now = Date.now();
    const job: GenerationJob = {
      id: randomUUID(),
      userId,
      status: 'processing',
      createdAt: now,
      updatedAt: now,
    };
    jobs.set(job.id, job);
    return job;
  },

  complete(id: string, result: any): void {
    const job = jobs.get(id);
    if (!job) return;
    job.status = 'completed';
    job.result = result;
    job.updatedAt = Date.now();
  },

  fail(id: string, error: string, errorStatus?: number): void {
    const job = jobs.get(id);
    if (!job) return;
    job.status = 'failed';
    job.error = error;
    job.errorStatus = errorStatus;
    job.updatedAt = Date.now();
  },

  /** Returns the job only if it belongs to the requesting user (ownership enforced). */
  get(id: string, userId: string): GenerationJob | null {
    const job = jobs.get(id);
    if (!job || job.userId !== userId) return null;
    return job;
  },
};
