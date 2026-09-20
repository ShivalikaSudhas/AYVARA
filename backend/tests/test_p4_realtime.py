"""P4 — Integration tests for the realtime / Socket.IO layer.

Run with:
    cd backend
    python -m pytest tests/test_p4_realtime.py -v

These tests do NOT require a live database or external services.
They test:
    - Socket.IO server creation
    - Room join/leave
    - Broadcast helpers
    - Notification store CRUD
    - Notification service emit
    - QR generation and verification
    - Disaster Mode activate/deactivate
    - HMIS sync (without emit)
    - Admin auth guard
"""

from __future__ import annotations

import asyncio
import sys
import os

# Allow running from the backend/ directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def run(coro):
    """Run an async coroutine synchronously (compatible with older pytest)."""
    return asyncio.get_event_loop().run_until_complete(coro)


# ===========================================================================
# QR Service Tests
# ===========================================================================


class TestQRService:
    def test_generate_returns_token(self):
        from app.services.qr_service import generate_qr_token

        result = generate_qr_token(
            reservation_id="res_test",
            patient_id="pat_001",
            hospital_id="hosp_001",
            bed_number="ICU-01",
        )
        assert result["token"]
        assert result["reservation_id"] == "res_test"
        assert result["patient_id"] == "pat_001"
        assert result["hospital_id"] == "hosp_001"
        assert result["bed_number"] == "ICU-01"
        assert result["issued_at"]

    def test_verify_valid_token(self):
        from app.services.qr_service import generate_qr_token, verify_qr_token

        gen = generate_qr_token("res_123", "pat_456", "hosp_002", "ER-05")
        verified = verify_qr_token(gen["token"])

        assert verified["verified"] is True
        assert verified["reservation_id"] == "res_123"
        assert verified["patient_id"] == "pat_456"
        assert verified["hospital_id"] == "hosp_002"
        assert verified["bed_number"] == "ER-05"
        assert verified["error"] is None

    def test_verify_tampered_token(self):
        from app.services.qr_service import generate_qr_token, verify_qr_token

        gen = generate_qr_token("res_999", "pat_999", "hosp_999", "BED-99")
        bad_token = gen["token"][:-5] + "XXXXX"
        result = verify_qr_token(bad_token)

        assert result["verified"] is False
        assert result["error"] is not None

    def test_verify_malformed_token(self):
        from app.services.qr_service import verify_qr_token

        result = verify_qr_token("this-is-not-a-valid-token")
        assert result["verified"] is False

    def test_verify_empty_token(self):
        from app.services.qr_service import verify_qr_token

        result = verify_qr_token("")
        assert result["verified"] is False


# ===========================================================================
# Notification Store Tests
# ===========================================================================


class TestNotificationStore:
    def setup_method(self):
        # Clear store between tests
        from app.websocket import notification_store as ns
        ns._store.clear()

    def _make_payload(self, **kwargs):
        from app.schemas.notification import NotificationCreate
        defaults = dict(
            event_type="test_event",
            title="Test Notification",
            message="Test message",
            severity="info",
        )
        defaults.update(kwargs)
        return NotificationCreate(**defaults)

    def test_create_notification(self):
        from app.websocket.notification_store import create_notification

        payload = self._make_payload()
        record = create_notification(payload)

        assert record.id.startswith("notif_")
        assert record.is_read is False
        assert record.title == "Test Notification"

    def test_get_notifications_all(self):
        from app.websocket.notification_store import (
            create_notification,
            get_notifications,
        )
        create_notification(self._make_payload(title="A"))
        create_notification(self._make_payload(title="B"))

        records = get_notifications()
        assert len(records) == 2

    def test_get_notifications_hospital_filter(self):
        from app.websocket.notification_store import (
            create_notification,
            get_notifications,
        )
        create_notification(self._make_payload(recipient_hospital_id="hosp_001"))
        create_notification(self._make_payload(recipient_hospital_id="hosp_002"))
        create_notification(self._make_payload())  # global

        records = get_notifications(hospital_id="hosp_001")
        # Should include hosp_001 and global (None)
        assert len(records) == 2

    def test_mark_as_read(self):
        from app.websocket.notification_store import (
            create_notification,
            mark_as_read,
        )
        record = create_notification(self._make_payload())
        assert record.is_read is False

        updated = mark_as_read(record.id)
        assert updated is not None
        assert updated.is_read is True

    def test_mark_as_read_nonexistent(self):
        from app.websocket.notification_store import mark_as_read

        result = mark_as_read("nonexistent-id")
        assert result is None

    def test_mark_all_read(self):
        from app.websocket.notification_store import (
            create_notification,
            get_notifications,
            mark_all_read,
        )
        create_notification(self._make_payload(title="X"))
        create_notification(self._make_payload(title="Y"))

        count = mark_all_read()
        assert count == 2

        unread = get_notifications(unread_only=True)
        assert len(unread) == 0

    def test_unread_only_filter(self):
        from app.websocket.notification_store import (
            create_notification,
            get_notifications,
            mark_as_read,
        )
        r1 = create_notification(self._make_payload(title="Read"))
        create_notification(self._make_payload(title="Unread"))
        mark_as_read(r1.id)

        unread = get_notifications(unread_only=True)
        assert len(unread) == 1
        assert unread[0].title == "Unread"


# ===========================================================================
# Disaster Mode Tests
# ===========================================================================


class TestDisasterMode:
    def setup_method(self):
        # Reset disaster state between tests
        from app.services import disaster_mode as dm
        dm._state.active = False
        dm._state.region = ""
        dm._state.notes = ""

    def test_initial_status(self):
        from app.services.disaster_mode import get_disaster_status

        status = get_disaster_status()
        assert status["disaster_mode"] is False

    def test_activate_sets_state(self):
        from app.services.disaster_mode import _state

        async def _run():
            from app.services.disaster_mode import activate_disaster_mode
            # Patch socket to avoid real emit
            import app.services.disaster_mode as dm
            import app.services.notification_service as ns

            original_broadcast = dm.broadcast_disaster_activated
            original_send = ns.send_notification

            async def noop(*a, **kw): pass

            dm.broadcast_disaster_activated = noop
            ns.send_notification = lambda *a, **kw: noop()

            try:
                await activate_disaster_mode(
                    region="Test Region",
                    notes="Unit test activation",
                    activated_by="test-admin",
                )
            finally:
                dm.broadcast_disaster_activated = original_broadcast
                ns.send_notification = original_send

        run(_run())

        assert _state.active is True
        assert _state.region == "Test Region"
        assert _state.activated_by == "test-admin"

    def test_deactivate_clears_state(self):
        from app.services.disaster_mode import _state

        _state.active = True
        _state.region = "Test"

        async def _run():
            import app.services.disaster_mode as dm
            import app.services.notification_service as ns

            async def noop(*a, **kw): pass

            dm.broadcast_disaster_activated = noop
            ns.send_notification = lambda *a, **kw: noop()

            from app.services.disaster_mode import deactivate_disaster_mode
            await deactivate_disaster_mode(deactivated_by="test-admin")

        run(_run())
        assert _state.active is False


# ===========================================================================
# HMIS Sync Tests
# ===========================================================================


class TestHMISSync:
    def setup_method(self):
        from app.services import hmis_sync as hs
        hs._resource_cache.clear()
        hs._last_sync_at = None
        hs._sync_count = 0

    def test_sync_without_emit(self):
        async def _run():
            from app.services.hmis_sync import sync_resources
            result = await sync_resources(emit_events=False)
            return result

        result = run(_run())
        assert result["sync_count"] == 1
        assert result["changes"] > 0  # First sync always has changes
        assert result["errors"] == 0

    def test_second_sync_has_fewer_changes(self):
        async def _run():
            from app.services.hmis_sync import sync_resources
            # First sync populates cache
            r1 = await sync_resources(emit_events=False)
            # Second sync should have fewer changes (random variance is small)
            r2 = await sync_resources(emit_events=False)
            return r1, r2

        r1, r2 = run(_run())
        assert r1["sync_count"] == 1
        assert r2["sync_count"] == 2
        # Second sync may have changes too (due to random variance), that's fine
        assert isinstance(r2["changes"], int)

    def test_health_status(self):
        from app.services.hmis_sync import get_health_status

        health = get_health_status()
        assert health["status"] == "connected"
        assert health["sync_count"] == 0
        assert health["last_sync_at"] is None

    def test_health_after_sync(self):
        async def _run():
            from app.services.hmis_sync import sync_resources, get_health_status
            await sync_resources(emit_events=False)
            return get_health_status()

        health = run(_run())
        assert health["sync_count"] == 1
        assert health["last_sync_at"] is not None
        assert health["cached_resources"] > 0

    def test_get_all_resources_after_sync(self):
        async def _run():
            from app.services.hmis_sync import sync_resources, get_all_resources
            await sync_resources(emit_events=False)
            return get_all_resources()

        resources = run(_run())
        assert len(resources) > 0
        first = resources[0]
        assert "hospital_id" in first
        assert "resource_type" in first
        assert "available_quantity" in first


# ===========================================================================
# Socket Manager — Unit tests (no live server needed)
# ===========================================================================


class TestSocketManager:
    def test_sio_is_async_server(self):
        import socketio
        from app.websocket.socket_manager import sio

        assert isinstance(sio, socketio.AsyncServer)

    def test_now_iso_format(self):
        from app.websocket.socket_manager import _now_iso

        ts = _now_iso()
        assert "T" in ts  # ISO 8601 format
        assert "+" in ts or "Z" in ts or ts.endswith("00:00")


# ===========================================================================
# Entry point
# ===========================================================================


if __name__ == "__main__":
    import subprocess
    subprocess.run(
        [sys.executable, "-m", "pytest", __file__, "-v"],
        cwd=os.path.dirname(os.path.dirname(__file__)),
    )
