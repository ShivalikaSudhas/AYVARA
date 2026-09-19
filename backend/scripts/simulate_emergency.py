#!/usr/bin/env python3
"""P4 — Emergency Simulator Script.

Simulates realistic emergency creation and dispatch events by POSTing to
the running backend API.

Usage:
    python scripts/simulate_emergency.py
    python scripts/simulate_emergency.py --count 5 --interval 3

Environment:
    BACKEND_URL   — base URL of the backend (default: http://localhost:8000)
    SIM_COUNT     — number of emergencies to simulate (default: 3)
    SIM_INTERVAL  — seconds between each (default: 5)
"""

import argparse
import json
import os
import random
import sys
import time

try:
    import httpx
except ImportError:
    print("ERROR: httpx not installed. Run: pip install httpx")
    sys.exit(1)

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
DEFAULT_COUNT = int(os.getenv("SIM_COUNT", "3"))
DEFAULT_INTERVAL = float(os.getenv("SIM_INTERVAL", "5"))

# ---------------------------------------------------------------------------
# Realistic test data
# ---------------------------------------------------------------------------

PATIENT_CONDITIONS = [
    "Severe Cardiac Arrest",
    "Acute Stroke",
    "Major Trauma — Road Traffic Accident",
    "Respiratory Failure",
    "Septic Shock",
    "Severe Burns — 40% BSA",
    "Gunshot Wound to Chest",
    "Anaphylactic Reaction",
    "Eclampsia",
    "Diabetic Ketoacidosis",
]

SEVERITIES = ["low", "moderate", "high", "critical"]
SPECIALTIES_POOL = [
    ["cardiology", "icu"],
    ["neurology", "icu"],
    ["trauma", "orthopedics"],
    ["pulmonology", "icu"],
    ["general"],
    ["burns", "icu"],
    ["cardiothoracic"],
    ["allergy"],
    ["obstetrics"],
    ["endocrinology"],
]
BLOOD_TYPES = ["O_negative", "A_positive", "B_positive", "AB_negative", None]

# Rough bounding box around NYC for realistic coordinates
LAT_RANGE = (40.60, 40.80)
LON_RANGE = (-74.10, -73.85)

HOSPITALS = [
    ("hosp_001", "City General Hospital"),
    ("hosp_002", "St. Jude Emergency Center"),
    ("hosp_003", "Metropolitan Medical Institute"),
    ("hosp_004", "Mercy Community Care"),
]

AMBULANCE_UNITS = [f"AMB-{i:02d}" for i in range(1, 10)]


def random_emergency_payload() -> dict:
    idx = random.randint(0, len(PATIENT_CONDITIONS) - 1)
    return {
        "patient_condition": PATIENT_CONDITIONS[idx],
        "severity": random.choice(SEVERITIES),
        "latitude": round(random.uniform(*LAT_RANGE), 6),
        "longitude": round(random.uniform(*LON_RANGE), 6),
        "required_specialties": SPECIALTIES_POOL[idx],
        "blood_type_needed": random.choice(BLOOD_TYPES),
    }


def simulate_one_emergency(client: "httpx.Client", verbose: bool = True) -> None:
    payload = random_emergency_payload()

    print(f"\n{'='*60}")
    print(f"  Simulating: {payload['patient_condition']}")
    print(f"  Severity:   {payload['severity']}")
    print(f"  Location:   ({payload['latitude']}, {payload['longitude']})")

    # POST /api/v1/emergency
    try:
        resp = client.post(
            f"{BACKEND_URL}/api/v1/emergency",
            json=payload,
            timeout=10.0,
        )
    except httpx.ConnectError:
        print(f"  ERROR: Cannot connect to {BACKEND_URL}")
        return

    if resp.status_code not in (200, 201):
        print(f"  ERROR creating emergency: {resp.status_code} {resp.text[:200]}")
        return

    data = resp.json()
    emergency_id = data.get("emergency_id", "")
    matches = data.get("matches", [])
    print(f"  ✓ Emergency created: {emergency_id}")

    if not matches:
        print("  No hospital matches returned — skipping dispatch")
        return

    best = matches[0]
    print(
        f"  Top match: {best['hospital_name']} "
        f"score={best['match_score']} dist={best['distance_km']}km "
        f"eta={best['estimated_eta_minutes']}min"
    )

    # POST /api/v1/dispatch
    dispatch_payload = {
        "emergency_id": emergency_id,
        "selected_hospital_id": best["hospital_id"],
        "ambulance_unit": random.choice(AMBULANCE_UNITS),
        "notes": f"Simulated dispatch — {payload['patient_condition']}",
    }

    try:
        d_resp = client.post(
            f"{BACKEND_URL}/api/v1/dispatch",
            json=dispatch_payload,
            timeout=10.0,
        )
    except httpx.ConnectError:
        print(f"  ERROR: Cannot connect to {BACKEND_URL} for dispatch")
        return

    if d_resp.status_code in (200, 201):
        d_data = d_resp.json()
        print(f"  ✓ Dispatched: {d_data.get('dispatch_id')} — unit {dispatch_payload['ambulance_unit']}")
    else:
        print(f"  WARNING dispatch failed: {d_resp.status_code} — {d_resp.text[:200]}")

    # Emit a test notification via P4 endpoint
    notif_payload = {
        "event_type": "emergency_alert",
        "title": f"Emergency: {payload['severity'].upper()} — {payload['patient_condition'][:40]}",
        "message": (
            f"Dispatching {dispatch_payload['ambulance_unit']} to "
            f"{best['hospital_name']} (ETA {best['estimated_eta_minutes']} min)"
        ),
        "severity": "critical" if payload["severity"] == "critical" else "warning",
        "meta": {"emergency_id": emergency_id, "dispatch_id": d_data.get("dispatch_id", "")},
    }
    try:
        n_resp = client.post(
            f"{BACKEND_URL}/api/v1/notifications/test-emit",
            json=notif_payload,
            timeout=5.0,
        )
        if n_resp.status_code in (200, 201):
            print(f"  ✓ Notification emitted via Socket.IO")
        else:
            print(f"  WARNING: Notification emit failed: {n_resp.status_code}")
    except httpx.ConnectError:
        print("  WARNING: Could not emit notification (Socket.IO endpoint unavailable)")


def main():
    parser = argparse.ArgumentParser(description="AYVARA Emergency Simulator")
    parser.add_argument(
        "--count",
        type=int,
        default=DEFAULT_COUNT,
        help=f"Number of emergencies to simulate (default: {DEFAULT_COUNT})",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=DEFAULT_INTERVAL,
        help=f"Seconds between emergencies (default: {DEFAULT_INTERVAL})",
    )
    parser.add_argument(
        "--url",
        default=BACKEND_URL,
        help=f"Backend base URL (default: {BACKEND_URL})",
    )
    args = parser.parse_args()

    print(f"AYVARA Emergency Simulator")
    print(f"Backend: {args.url}")
    print(f"Simulating {args.count} emergencies, {args.interval}s apart\n")

    with httpx.Client(base_url=args.url) as client:
        # Health check
        try:
            health = client.get("/", timeout=5.0)
            print(f"Backend health: {health.json().get('status', 'unknown')}")
        except Exception as exc:
            print(f"WARNING: Backend health check failed: {exc}")

        for i in range(args.count):
            print(f"\n[{i + 1}/{args.count}] Generating emergency...")
            simulate_one_emergency(client)
            if i < args.count - 1:
                print(f"  Waiting {args.interval}s...")
                time.sleep(args.interval)

    print(f"\n\nSimulation complete: {args.count} emergencies processed.")


if __name__ == "__main__":
    main()
