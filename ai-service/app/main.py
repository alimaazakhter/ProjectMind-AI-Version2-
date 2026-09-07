import asyncio
import logging
import time
import uuid
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.config import settings
from app.schemas.blueprint import (
    BlueprintGenerateRequest,
    BlueprintResponse,
    ChatRequest,
    ChatResponse,
)
from app.agents.orchestrator import MultiAgentOrchestrator
from app.agents.chat_agent import ChatAgent
from app.services.gemini_service import gemini_client, QuotaExceededError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("main")

app = FastAPI(
    title="ProjectMind AI — Python AI Microservice",
    description="High-throughput Multi-Agent AI Engine powered by Google Gemini and FastAPI",
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AIConfigUpdateRequest(BaseModel):
    model: Optional[str] = None
    temperature: Optional[float] = None
    provider: Optional[str] = None

# Health / Readiness Probe
@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
@app.get("/api/v1/ai/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "ProjectMind AI FastAPI Worker",
        "version": "1.0.0",
        "gemini_configured": gemini_client.is_configured,
        "model": gemini_client.model_name,
        "timestamp": time.time(),
    }

# Diagnostics Ping Probe
@app.get("/api/v1/ai/ping", tags=["Diagnostics"])
@app.post("/api/v1/ai/ping", tags=["Diagnostics"])
async def ping_diagnostic():
    start_time = time.time()
    gemini_status = "Online" if gemini_client.is_configured else "Unconfigured"
    latency_ms = int((time.time() - start_time) * 1000)
    return {
        "status": "Healthy",
        "service": "FastAPI AI Service",
        "port": "8000",
        "latencyMs": latency_ms,
        "geminiStatus": gemini_status,
        "activeModel": gemini_client.model_name,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

# AI Engine Runtime Configuration (Admin)
@app.get("/api/v1/ai/config", tags=["Admin Configuration"])
async def get_ai_config():
    config = gemini_client.get_config()
    return {
        "success": True,
        "data": config,
    }

@app.post("/api/v1/ai/config", tags=["Admin Configuration"])
async def update_ai_config(payload: AIConfigUpdateRequest):
    updated = gemini_client.set_config(model_name=payload.model, temperature=payload.temperature, provider=payload.provider)
    return {
        "success": True,
        "message": "AI configuration updated successfully.",
        "data": updated,
    }

# ----------------------------------------------------------------------------
# Async Blueprint Generation
#
# A full generation takes 90–200s, which exceeds the ~100s edge/proxy timeout that
# fronts most PaaS (Render/Cloudflare). A synchronous endpoint therefore gets its
# connection cut and returns 502 even when the work is fine. So generation runs as a
# background asyncio task: POST /generate returns a jobId immediately, and the caller
# polls GET /generate/status/{jobId}. Every HTTP request stays short.
# ----------------------------------------------------------------------------
_GEN_JOBS: Dict[str, Dict[str, Any]] = {}
_JOB_TTL_S = 30 * 60  # evict finished jobs after 30 minutes


def _sweep_jobs() -> None:
    now = time.time()
    for jid in [j for j, v in _GEN_JOBS.items() if now - v.get("created", now) > _JOB_TTL_S]:
        _GEN_JOBS.pop(jid, None)


async def _run_generation(job_id: str, request: BlueprintGenerateRequest) -> None:
    try:
        result = await MultiAgentOrchestrator.generate_blueprint(request)
        _GEN_JOBS[job_id].update(status="completed", result=result)
    except QuotaExceededError as err:
        logger.warning(f"Blueprint generation rate-limited: {err}")
        _GEN_JOBS[job_id].update(status="failed", error=str(err), error_status=429)
    except Exception as err:
        logger.error(f"Blueprint generation failed: {err}", exc_info=True)
        _GEN_JOBS[job_id].update(status="failed", error=f"AI Blueprint Generation failed: {str(err)}", error_status=502)


@app.post("/api/v1/ai/generate", status_code=status.HTTP_202_ACCEPTED, tags=["AI Generation"])
async def start_generate_blueprint(request: BlueprintGenerateRequest):
    """Start generation in the background and return a job id to poll."""
    _sweep_jobs()
    job_id = str(uuid.uuid4())
    _GEN_JOBS[job_id] = {"status": "processing", "created": time.time()}
    logger.info(f"Queued Blueprint Generation job {job_id} for '{request.title_idea}' [{request.domain}]")
    asyncio.create_task(_run_generation(job_id, request))
    return {"jobId": job_id, "status": "processing"}


@app.get("/api/v1/ai/debug/trace", tags=["Diagnostics"])
async def debug_trace():
    """Recent provider attempts (provider, model, ms, outcome) for latency diagnosis."""
    from app.services.llm_service import get_trace
    return {"trace": get_trace()}


@app.get("/api/v1/ai/generate/status/{job_id}", tags=["AI Generation"])
async def generate_status(job_id: str):
    """Poll a generation job. Returns processing / completed (+result) / failed (+detail)."""
    job = _GEN_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation job not found or expired.")
    if job["status"] == "completed":
        return {"status": "completed", "result": job["result"]}
    if job["status"] == "failed":
        return {"status": "failed", "detail": job.get("error"), "errorStatus": job.get("error_status", 502)}
    return {"status": "processing"}

# Conversational AI Assistant & Intent Classification
@app.post(
    "/api/v1/ai/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    tags=["AI Chat"],
)
async def chat_assistant(request: ChatRequest):
    try:
        logger.info(f"Received Chat Query: {request.prompt[:60]}...")
        result = await ChatAgent.execute(
            prompt=request.prompt,
            project_context=request.project_context,
            history=request.conversation_history,
        )
        return result
    except QuotaExceededError as err:
        logger.warning(f"Chat rate-limited: {err}")
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(err))
    except Exception as err:
        logger.error(f"Chat assistant failed: {err}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Chat generation failed: {str(err)}",
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
