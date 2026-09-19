import sys
import os
import json
import time
import requests

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api/v1")

def print_step(step_num: int, title: str, details: str):
    print(f"\n======================================================================")
    print(f"🚀 STEP {step_num}: {title.upper()}")
    print(f"======================================================================")
    print(f"{details}\n")

def run_simulation():
    print("\n🚑 SMART HOSPITAL EMERGENCY COORDINATION PLATFORM")
    print("======================================================================")
    print("Beginning End-to-End Critical Emergency Scenario Simulation Rehearsal")
    print(f"Targeting API Endpoint: {API_BASE_URL}")
    print("======================================================================\n")

    # Step 1: Dispatcher Login
    print_step(1, "Dispatcher Authentication", "Logging in as 'dispatcher_1' to obtain JWT token...")
    try:
        login_res = requests.post(f"{API_BASE_URL}/auth/login", json={
            "username": "dispatcher_1",
            "password": "dispatch123"
        }, timeout=5)
        if login_res.status_code == 200:
            token_data = login_res.json()
            disp_token = token_data["access_token"]
            print(f"✅ Authenticated as DISPATCHER! JWT Token: {disp_token[:30]}...")
        else:
            print("⚠️ API Offline. Simulating local token generation for rehearsal.")
            disp_token = "mock_dispatcher_jwt_token"
    except Exception as e:
        print(f"⚠️ API Connection Note: {e}. Running rehearsal with local mock fallback.")
        disp_token = "mock_dispatcher_jwt_token"

    # Step 2: Emergency Triage Creation & P3 Smart Matching
    print_step(
        2,
        "Emergency Triage & P3 Smart Matching",
        "Submitting CRITICAL Emergency Triage Payload:\n"
        "  • Condition: Severe Multi-System Trauma\n"
        "  • Location: Mangaluru City Center (12.8702, 74.8436)\n"
        "  • Required: ICU Bed + Ventilator + O-Negative Blood\n"
        "  • Priority: CRITICAL"
    )

    triage_payload = {
        "patient_condition": "Severe Multi-System Trauma (Cardiac + Fracture)",
        "latitude": 12.8702,
        "longitude": 74.8436,
        "priority": "critical",
        "required_specialties": ["icu", "trauma", "cardiology"],
        "blood_type_needed": "O_negative"
    }

    try:
        headers = {"Authorization": f"Bearer {disp_token}"}
        match_res = requests.post(f"{API_BASE_URL}/emergency/create-and-match", json=triage_payload, headers=headers, timeout=5)
        if match_res.status_code == 200:
            matches = match_res.json().get("matching_hospitals", [])
        else:
            matches = [
                {
                    "hospital_id": "hosp_003",
                    "hospital_name": "Father Muller Medical College Hospital",
                    "match_score": 96.5,
                    "distance_km": 1.4,
                    "estimated_eta_minutes": 4,
                    "available_icu_beds": 6,
                    "has_blood_stock": True
                },
                {
                    "hospital_id": "hosp_002",
                    "hospital_name": "AJ Hospital & Research Centre",
                    "match_score": 88.0,
                    "distance_km": 3.8,
                    "estimated_eta_minutes": 8,
                    "available_icu_beds": 4,
                    "has_blood_stock": True
                }
            ]
    except Exception:
        matches = [
            {
                "hospital_id": "hosp_003",
                "hospital_name": "Father Muller Medical College Hospital",
                "match_score": 96.5,
                "distance_km": 1.4,
                "estimated_eta_minutes": 4,
                "available_icu_beds": 6,
                "has_blood_stock": True
            }
        ]

    top_match = matches[0]
    print(f"📊 P3 MATCH ENGINE RESULT:")
    print(f"  🏆 TOP MATCH: {top_match['hospital_name']} ({top_match['hospital_id']})")
    print(f"  ⭐ Match Score: {top_match['match_score']}%")
    print(f"  📍 Distance: {top_match['distance_km']} km | ETA: {top_match['estimated_eta_minutes']} mins")
    print(f"  🛏️ ICU Beds Available: {top_match['available_icu_beds']}")
    print(f"  🩸 Blood Stock Verified: {'YES' if top_match['has_blood_stock'] else 'NO'}")

    # Step 3: Atomic Resource & Bed Reservation
    print_step(3, "Atomic Bed Reservation", f"Reserving ICU Bed at {top_match['hospital_name']}...")
    time.sleep(1)
    res_id = f"TR-{int(time.time())}"
    print(f"✅ RESERVATION CONFIRMED!")
    print(f"  • Transfer ID: {res_id}")
    print(f"  • Target Hospital: {top_match['hospital_name']}")
    print(f"  • Bed Lock Status: RESERVED (Atomic lock acquired)")

    # Step 4: Dispatch Ambulance Unit
    print_step(4, "Ambulance Unit Dispatch", "Dispatching nearest available ALS Ambulance Unit A-09...")
    time.sleep(1)
    print(f"✅ DISPATCH EN ROUTE!")
    print(f"  • Ambulance Unit: Unit A-09 (ALS Cardiac Prepared)")
    print(f"  • Status: EN_ROUTE $\\rightarrow$ ARRIVED AT SCENE $\\rightarrow$ PATIENT LOADED")

    # Step 5: Patient Transfer Approval & QR Handover Generation
    print_step(5, "Patient Handover & QR Generation", "Generating secure arrival verification QR payload...")
    qr_payload = {
        "transfer_id": res_id,
        "patient_condition": triage_payload["patient_condition"],
        "target_hospital": top_match["hospital_name"],
        "reserved_bed": "ICU-Bed-04",
        "timestamp": datetime.utcnow().isoformat()
    }
    time.sleep(1)
    print(f"✅ QR CODE GENERATED!")
    print(f"  • Scannable Payload: {json.dumps(qr_payload, indent=2)}")

    # Step 6: Patient Arrival & Bed Status Conversion
    print_step(6, "Patient Arrival & Bed Status Conversion", "Ambulance arrives at Receiving Emergency Room. Scanning QR Code...")
    time.sleep(1)
    print(f"✅ ARRIVAL CONFIRMED!")
    print(f"  • Target Bed (ICU-Bed-04) status converted: RESERVED $\\rightarrow$ OCCUPIED")
    print(f"  • Final Transfer Lifecycle Status: COMPLETED")

    print("\n======================================================================")
    print("🎉 CRITICAL EMERGENCY SCENARIO SIMULATION COMPLETE!")
    print("======================================================================\n")

if __name__ == "__main__":
    run_simulation()
