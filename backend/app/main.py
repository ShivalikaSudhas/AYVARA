"""FastAPI application main entry point for Smart Hospital Coordination platform."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.emergency import router as emergency_router
from app.api.dispatch import router as dispatch_router
from app.api.transfers import router as transfers_router
from app.api.analytics import router as analytics_router

app = FastAPI(
    title="Smart Hospital Resource Coordination API",
    description="Real-time multi-hospital emergency resource coordination platform.",
    version="1.0.0"
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api/v1
app.include_router(emergency_router, prefix="/api/v1")
app.include_router(dispatch_router, prefix="/api/v1")
app.include_router(transfers_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")


@app.get("/", tags=["Health Check"])
def root_health_check():
    return {
        "status": "online",
        "service": "Smart Hospital Coordination Backend API",
        "version": "1.0.0"
    }
