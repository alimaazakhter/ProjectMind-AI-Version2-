import logging
import time
from typing import Optional
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
from app.services.gemini_service import gemini_client

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

# Health / Readiness Probe
@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
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
    updated = gemini_client.set_config(model_name=payload.model, temperature=payload.temperature)
    return {
        "success": True,
        "message": "AI configuration updated successfully.",
        "data": updated,
    }

# Multi-Agent Blueprint Generation
@app.post(
    "/api/v1/ai/generate",
    response_model=BlueprintResponse,
    status_code=status.HTTP_200_OK,
    tags=["AI Generation"],
)
async def generate_blueprint(request: BlueprintGenerateRequest):
    try:
        logger.info(f"Received Blueprint Generation Request for '{request.title_idea}' in [{request.domain}]")
        result = await MultiAgentOrchestrator.generate_blueprint(request)
        return result
    except Exception as err:
        logger.error(f"Blueprint generation failed: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Blueprint Generation failed: {str(err)}",
        )

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
        if gemini_client.is_configured:
            result = await ChatAgent.execute(
                prompt=request.prompt,
                project_context=request.project_id,
                history=request.conversation_history,
            )
            return result
        else:
            return {
                "content": f"I can assist you with your academic project. Here are recommendations for **{request.prompt}**:\n\n1. **Decoupled Architecture**: Separate your presentation layer, API gateway, and microservice workers.\n2. **Database Normalization**: Ensure foreign key constraints and indexes are placed on relational tables.\n3. **Viva Defense**: Be prepared to explain your concurrency model, auth token validation, and caching strategy.",
                "intent": "general_query",
                "confidence": 0.92,
                "suggestedActions": [
                    "How to prepare architecture viva questions?",
                    "Generate optimal database schema for this project",
                ],
            }
    except Exception as err:
        logger.error(f"Chat assistant failed: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat generation failed: {str(err)}",
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
