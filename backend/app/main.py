"""FastAPI application main entry point for Smart Hospital Coordination platform."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.citizen_reports import router as citizen_reports_router
from app.api.emergency import router as emergency_router
from app.api.dispatch import router as dispatch_router
from app.api.transfers import router as transfers_router
from app.api.analytics import router as analytics_router
from app.api.hospitals import router as hospitals_router
from app.api.departments import router as departments_router
from app.api.resources import router as resources_router
from app.api.beds import router as beds_router
from app.api.blood import router as blood_router

# P4 — Realtime routers
from app.api.disaster import router as disaster_router
from app.api.notifications import router as notifications_router
from app.api.qr import router as qr_router
from app.api.sync import router as sync_router

# P4 — ASGI wrapper (mounts Socket.IO on /ws/socket.io)
from app.websocket.asgi import create_asgi_app

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

# Register Auth & Citizen Reports Routers under /api/v1
app.include_router(auth_router, prefix="/api/v1")
app.include_router(citizen_reports_router, prefix="/api/v1")

# Register core API Routers under /api/v1
app.include_router(emergency_router, prefix="/api/v1")
app.include_router(dispatch_router, prefix="/api/v1")
app.include_router(transfers_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(hospitals_router, prefix="/api/v1")
app.include_router(departments_router, prefix="/api/v1")
app.include_router(resources_router, prefix="/api/v1")
app.include_router(beds_router, prefix="/api/v1")
app.include_router(blood_router, prefix="/api/v1")

# Register P4 routers under /api/v1
app.include_router(disaster_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(qr_router, prefix="/api/v1")
app.include_router(sync_router, prefix="/api/v1")


@app.get("/", tags=["Health Check"])
def root_health_check():
    return {
        "status": "online",
        "service": "Smart Hospital Coordination Backend API",
        "version": "1.0.0"
    }


# P4 — Wrap FastAPI with Socket.IO ASGI layer.
asgi_app = create_asgi_app(app)
