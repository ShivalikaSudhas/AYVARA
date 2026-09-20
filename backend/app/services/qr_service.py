"""P4 — QR code generation and scanning service.

Generates opaque, HMAC-signed QR payloads for reservation handover.
Verification checks the signature and returns the embedded data.

QR payload format (base64url-encoded JSON + HMAC-SHA256 signature):
    {
        "reservation_id": "res_8871",
        "patient_id": "pat_9982",
        "hospital_id": "hosp_001",
        "bed_number": "ICU-04",
        "issued_at": "2026-09-19T12:45:00Z"
    }

The token is: base64url(json_payload) + "." + base64url(hmac_signature)

The `qr_image_base64` field returned is a PNG data-URI ready for display.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import io
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger("p4.qr_service")

# Secret key sourced from app config (falls back to a dev default)
try:
    from app.config import settings
    _QR_SECRET: bytes = settings.SECRET_KEY.encode()
except Exception:
    _QR_SECRET = b"p4-dev-qr-secret"  # fallback for isolated tests


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(s: str) -> bytes:
    # Add padding
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s)


def _sign(payload_b64: str) -> str:
    sig = hmac.new(_QR_SECRET, payload_b64.encode(), hashlib.sha256).digest()
    return _b64url_encode(sig)


def _generate_qr_png_b64(text: str) -> Optional[str]:
    """Return a base64-encoded PNG data-URI, or None if qrcode is unavailable."""
    try:
        import qrcode  # type: ignore[import-not-found]

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=8,
            border=4,
        )
        qr.add_data(text)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        encoded = base64.b64encode(buf.getvalue()).decode()
        return f"data:image/png;base64,{encoded}"
    except ImportError:
        logger.warning("qrcode library not installed — returning text token only")
        return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_qr_token(
    reservation_id: str,
    patient_id: str,
    hospital_id: str,
    bed_number: str,
) -> dict:
    """Generate a signed QR token for a reservation handover.

    Returns a dict with:
        token       — opaque signed string (embed in QR code)
        qr_image    — data-URI PNG (ready for <img src="...">), or None
        reservation_id, patient_id, hospital_id, bed_number — echoed back
        issued_at   — ISO 8601 UTC
    """
    issued_at = datetime.now(timezone.utc).isoformat()
    payload_dict = {
        "reservation_id": reservation_id,
        "patient_id": patient_id,
        "hospital_id": hospital_id,
        "bed_number": bed_number,
        "issued_at": issued_at,
    }
    payload_json = json.dumps(payload_dict, separators=(",", ":"))
    payload_b64 = _b64url_encode(payload_json.encode())
    signature = _sign(payload_b64)
    token = f"{payload_b64}.{signature}"

    qr_image = _generate_qr_png_b64(token)

    logger.info(
        "QR token generated: reservation=%s hospital=%s bed=%s",
        reservation_id, hospital_id, bed_number,
    )
    return {
        "token": token,
        "qr_image": qr_image,
        "reservation_id": reservation_id,
        "patient_id": patient_id,
        "hospital_id": hospital_id,
        "bed_number": bed_number,
        "issued_at": issued_at,
    }


def verify_qr_token(token: str) -> dict:
    """Verify a QR token and return the embedded data.

    Returns:
        {
            "verified": bool,
            "reservation_id": str,
            "patient_id": str,
            "hospital_id": str,
            "bed_number": str,
            "issued_at": str,
            "error": str | None,
        }
    """
    failure = {
        "verified": False,
        "reservation_id": None,
        "patient_id": None,
        "hospital_id": None,
        "bed_number": None,
        "issued_at": None,
        "error": None,
    }

    try:
        parts = token.split(".")
        if len(parts) != 2:
            failure["error"] = "Malformed token: expected payload.signature"
            return failure

        payload_b64, provided_sig = parts

        # Verify HMAC
        expected_sig = _sign(payload_b64)
        if not hmac.compare_digest(expected_sig, provided_sig):
            failure["error"] = "Invalid signature"
            return failure

        payload_json = _b64url_decode(payload_b64).decode()
        data = json.loads(payload_json)

        logger.info(
            "QR token verified: reservation=%s hospital=%s",
            data.get("reservation_id"), data.get("hospital_id"),
        )
        return {
            "verified": True,
            "reservation_id": data.get("reservation_id"),
            "patient_id": data.get("patient_id"),
            "hospital_id": data.get("hospital_id"),
            "bed_number": data.get("bed_number"),
            "issued_at": data.get("issued_at"),
            "error": None,
        }

    except Exception as exc:  # noqa: BLE001
        logger.error("QR verification error: %s", exc)
        failure["error"] = str(exc)
        return failure
