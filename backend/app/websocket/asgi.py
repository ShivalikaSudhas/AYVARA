"""P4 — ASGI application that mounts Socket.IO on top of FastAPI.

Import and use `asgi_app` as the top-level ASGI application:

    uvicorn app.websocket.asgi:asgi_app --reload

`asgi_app` wraps the FastAPI `app` so that Socket.IO requests (path /ws/*)
are handled by socketio.ASGIApp and all other requests fall through to FastAPI.
"""

import socketio  # type: ignore[import-not-found]

from app.websocket.socket_manager import sio

# This import registers all Socket.IO event handlers defined there
import app.websocket.events  # noqa: F401


def create_asgi_app(fastapi_app):
    """Wrap a FastAPI app with the Socket.IO ASGI layer.

    Args:
        fastapi_app: The FastAPI application instance.

    Returns:
        A combined ASGI application.
    """
    return socketio.ASGIApp(
        socketio_server=sio,
        other_asgi_app=fastapi_app,
        socketio_path="/ws/socket.io",
    )
