#!/usr/bin/env python3
"""P4 — HMIS Sync Simulator Script.

Simulates continuous HMIS synchronization cycles by repeatedly triggering
the /api/v1/sync/hmis endpoint.  Also verifies resource_change Socket.IO
events reach the backend.

Usage:
    python scripts/simulate_hmis.py
    python scripts/simulate_hmis.py --cycles 5 --interval 10

Environment:
    BACKEND_URL    — base URL of the backend (default: http://localhost:8000)
    HMIS_CYCLES    — number of sync cycles to run (default: 5, 0=infinite)
    HMIS_INTERVAL  — seconds between each cycle (default: 10)
    ADMIN_ID       — admin identifier for auth header (default: hmis-simulator)
"""

import argparse
import os
import sys
import time

try:
    import httpx
except ImportError:
    print("ERROR: httpx not installed. Run: pip install httpx")
    sys.exit(1)

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
DEFAULT_CYCLES = int(os.getenv("HMIS_CYCLES", "5"))
DEFAULT_INTERVAL = float(os.getenv("HMIS_INTERVAL", "10"))
ADMIN_ID = os.getenv("ADMIN_ID", "hmis-simulator")


def run_sync_cycle(client: "httpx.Client", cycle_num: int) -> None:
    print(f"\n{'─'*50}")
    print(f"  Cycle {cycle_num} — Triggering HMIS sync...")

    try:
        resp = client.post(
            f"{BACKEND_URL}/api/v1/sync/hmis",
            params={"admin_id": ADMIN_ID, "emit_events": "true"},
            timeout=15.0,
        )
    except httpx.ConnectError:
        print(f"  ERROR: Cannot connect to {BACKEND_URL}")
        return

    if resp.status_code != 200:
        print(f"  ERROR: {resp.status_code} — {resp.text[:300]}")
        return

    data = resp.json()
    print(f"  ✓ Sync #{data.get('sync_count')} complete")
    print(f"    Changes detected: {data.get('changes', 0)}")
    print(f"    Errors:           {data.get('errors', 0)}")
    print(f"    Synced at:        {data.get('synced_at', 'N/A')}")

    detail = data.get("detail", [])
    if detail:
        print(f"    Resource changes:")
        for change in detail[:5]:  # Show first 5 changes
            print(
                f"      {change['hospital_name']}: "
                f"{change['resource_name']} "
                f"{change.get('old_quantity', '?')} → {change['new_quantity']} {change['unit']}"
            )
        if len(detail) > 5:
            print(f"      ... and {len(detail) - 5} more")


def check_health(client: "httpx.Client") -> bool:
    try:
        resp = client.get(f"{BACKEND_URL}/api/v1/sync/hmis/health", timeout=5.0)
        if resp.status_code == 200:
            health = resp.json()
            print(f"  HMIS health: {health}")
            return True
    except httpx.ConnectError:
        pass
    print(f"  WARNING: HMIS health endpoint unreachable")
    return False


def show_resources(client: "httpx.Client") -> None:
    try:
        resp = client.get(f"{BACKEND_URL}/api/v1/sync/hmis/resources", timeout=5.0)
        if resp.status_code == 200:
            resources = resp.json().get("resources", [])
            print(f"\n  Current resource cache: {len(resources)} entries")
            for r in resources[:8]:
                print(
                    f"    [{r['hospital_id']}] {r['resource_name']}: "
                    f"{r['available_quantity']} {r['unit']}"
                )
            if len(resources) > 8:
                print(f"    ... and {len(resources) - 8} more")
    except Exception as exc:
        print(f"  WARNING: Could not fetch resources: {exc}")


def main():
    parser = argparse.ArgumentParser(description="AYVARA HMIS Sync Simulator")
    parser.add_argument(
        "--cycles",
        type=int,
        default=DEFAULT_CYCLES,
        help=f"Sync cycles to run, 0=infinite (default: {DEFAULT_CYCLES})",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=DEFAULT_INTERVAL,
        help=f"Seconds between cycles (default: {DEFAULT_INTERVAL})",
    )
    parser.add_argument(
        "--url",
        default=BACKEND_URL,
        help=f"Backend base URL (default: {BACKEND_URL})",
    )
    parser.add_argument(
        "--admin-id",
        default=ADMIN_ID,
        help=f"Admin ID for auth (default: {ADMIN_ID})",
    )
    args = parser.parse_args()

    infinite = args.cycles == 0
    print(f"AYVARA HMIS Sync Simulator")
    print(f"Backend:  {args.url}")
    print(f"Cycles:   {'infinite' if infinite else args.cycles}")
    print(f"Interval: {args.interval}s")
    print(f"Admin ID: {args.admin_id}\n")

    global ADMIN_ID
    ADMIN_ID = args.admin_id

    with httpx.Client(base_url=args.url) as client:
        # Health check
        try:
            health = client.get("/", timeout=5.0)
            print(f"Backend status: {health.json().get('status', 'unknown')}")
        except Exception as exc:
            print(f"WARNING: Backend unreachable: {exc}")

        check_health(client)

        cycle = 1
        try:
            while infinite or cycle <= args.cycles:
                run_sync_cycle(client, cycle)

                if not infinite and cycle == args.cycles:
                    break

                print(f"  Waiting {args.interval}s until next cycle...")
                time.sleep(args.interval)
                cycle += 1
        except KeyboardInterrupt:
            print("\n\nInterrupted by user.")

        # Final resource snapshot
        print("\n--- Final resource state ---")
        show_resources(client)

    print(f"\nHMIS simulation complete: {cycle} cycles run.")


if __name__ == "__main__":
    main()
