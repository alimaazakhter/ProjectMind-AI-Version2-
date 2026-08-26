import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
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

# Health / Readiness Probe
@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "ProjectMind AI FastAPI Worker",
        "version": "1.0.0",
        "gemini_configured": gemini_client.is_configured,
        "model": settings.GEMINI_MODEL,
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
            # Fallback smart assistant response
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
