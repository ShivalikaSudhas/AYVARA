"""P4 — WebSocket package initializer.

Exports the shared sio instance and the ASGI factory so other modules
can import from app.websocket directly.
"""

from app.websocket.socket_manager import sio
from app.websocket.asgi import create_asgi_app

__all__ = ["sio", "create_asgi_app"]
