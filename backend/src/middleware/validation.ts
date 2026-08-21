import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const generatorPayloadSchema = z.object({
  titleIdea: z.string().optional(),
  domain: z.string().min(1, 'Domain is required'),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  preferredTech: z.array(z.string()).default([]),
  complexity: z.string().default('Production Grade Architecture'),
  agentMode: z.enum(['single', 'multi']).default('multi'),
  customRequirements: z.string().optional(),
});

export const chatPayloadSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  projectId: z.string().uuid().optional().nullable(),
});

export const projectUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  tagline: z.string().optional(),
  domain: z.string().optional(),
  complexity: z.string().optional(),
  problem_statement: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  features: z.array(z.any()).optional(),
  tech_stack: z.array(z.any()).optional(),
  architecture: z.any().optional(),
  datasets: z.array(z.any()).optional(),
  research_references: z.array(z.any()).optional(),
  roadmap: z.array(z.any()).optional(),
  viva_questions: z.array(z.any()).optional(),
  starter_code: z.array(z.any()).optional(),
  uniquifier_suggestions: z.array(z.string()).optional(),
});

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
