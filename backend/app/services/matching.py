"""P3 — Hospital-to-resource matching algorithm service."""

import math
from typing import List, Optional
from app.schemas.emergency import EmergencyCreate, HospitalMatchResult


# Seed mock hospitals data for testing & fallback before P2 DB wiring
MOCK_HOSPITALS = [
    {
        "id": "hosp_001",
        "name": "City General Hospital",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "total_available_beds": 14,
        "available_icu_beds": 3,
        "specialties": ["cardiology", "icu", "trauma", "neurology"],
        "blood_stock": {"O_negative": 5, "A_positive": 12, "B_positive": 8}
    },
    {
        "id": "hosp_002",
        "name": "St. Jude Emergency Center",
        "latitude": 40.7306,
        "longitude": -73.9352,
        "total_available_beds": 8,
        "available_icu_beds": 1,
        "specialties": ["icu", "pediatrics", "burns"],
        "blood_stock": {"O_negative": 0, "A_positive": 4, "B_positive": 2}
    },
    {
        "id": "hosp_003",
        "name": "Metropolitan Medical Institute",
        "latitude": 40.7589,
        "longitude": -73.9851,
        "total_available_beds": 22,
        "available_icu_beds": 6,
        "specialties": ["cardiology", "icu", "trauma", "orthopedics", "neurosurgery"],
        "blood_stock": {"O_negative": 10, "A_positive": 20, "B_positive": 15}
    },
    {
        "id": "hosp_004",
        "name": "Mercy Community Care",
        "latitude": 40.6782,
        "longitude": -73.9442,
        "total_available_beds": 2,
        "available_icu_beds": 0,
        "specialties": ["general", "maternity"],
        "blood_stock": {"O_negative": 1, "A_positive": 3, "B_positive": 2}
    }
]


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on Earth in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def estimate_eta_minutes(distance_km: float, city_speed_kmh: float = 35.0) -> int:
    """Estimate ambulance arrival time in minutes given distance in km."""
    travel_time_hours = distance_km / city_speed_kmh
    dispatch_overhead_minutes = 2
    total_minutes = int(round(travel_time_hours * 60)) + dispatch_overhead_minutes
    return max(3, total_minutes)


def calculate_match_score(
    distance_km: float,
    available_beds: int,
    available_icu_beds: int,
    required_specialties: List[str],
    hospital_specialties: List[str],
    blood_needed: Optional[str],
    hospital_blood_stock: dict
) -> tuple[float, List[str], bool]:
    """
    Computes a weighted match score (0-100) based on:
    - Distance / Proximity (35%)
    - Available Bed & ICU Capacity (35%)
    - Specialty Coverage (15%)
    - Blood Stock Availability (15%)
    """
    # 1. Proximity Score (0 to 100) — 100 for 0km, 0 for >= 25km
    distance_score = max(0.0, 100.0 - (distance_km * 4.0))

    # 2. Bed Capacity Score (0 to 100)
    icu_needed = "icu" in [s.lower() for s in required_specialties]
    target_beds = available_icu_beds if icu_needed else available_beds

    if target_beds <= 0:
        bed_score = 0.0
    elif target_beds == 1:
        bed_score = 50.0
    elif target_beds == 2:
        bed_score = 75.0
    else:
        bed_score = 100.0

    # 3. Specialty Coverage Score (0 to 100)
    matched_specialties = []
    if required_specialties:
        h_specs_lower = [s.lower() for s in hospital_specialties]
        for req in required_specialties:
            if req.lower() in h_specs_lower:
                matched_specialties.append(req)
        specialty_score = (len(matched_specialties) / len(required_specialties)) * 100.0
    else:
        specialty_score = 100.0

    # 4. Blood Stock Score (0 to 100)
    has_blood = True
    if blood_needed:
        stock_count = hospital_blood_stock.get(blood_needed, 0)
        has_blood = stock_count > 0
        blood_score = 100.0 if has_blood else 0.0
    else:
        blood_score = 100.0

    # Weighted Total Score
    total_score = (
        (distance_score * 0.35)
        + (bed_score * 0.35)
        + (specialty_score * 0.15)
        + (blood_score * 0.15)
    )

    return round(total_score, 1), matched_specialties, has_blood


def find_matching_hospitals(
    emergency: EmergencyCreate,
    hospitals: Optional[List[dict]] = None
) -> List[HospitalMatchResult]:
    """
    Ranks hospitals for a given emergency request using multi-criteria scoring algorithm.
    Returns sorted list of HospitalMatchResult objects (highest match score first).
    """
    hospital_list = hospitals or MOCK_HOSPITALS
    results: List[HospitalMatchResult] = []

    for hosp in hospital_list:
        dist = haversine_distance(
            emergency.latitude,
            emergency.longitude,
            hosp["latitude"],
            hosp["longitude"]
        )
        eta = estimate_eta_minutes(dist)

        score, matched_specs, has_blood = calculate_match_score(
            distance_km=dist,
            available_beds=hosp["total_available_beds"],
            available_icu_beds=hosp["available_icu_beds"],
            required_specialties=emergency.required_specialties,
            hospital_specialties=hosp["specialties"],
            blood_needed=emergency.blood_type_needed,
            hospital_blood_stock=hosp["blood_stock"]
        )

        # Only include hospitals with at least minimal capacity or score
        results.append(
            HospitalMatchResult(
                hospital_id=hosp["id"],
                hospital_name=hosp["name"],
                latitude=hosp["latitude"],
                longitude=hosp["longitude"],
                match_score=score,
                distance_km=dist,
                estimated_eta_minutes=eta,
                available_icu_beds=hosp["available_icu_beds"],
                total_available_beds=hosp["total_available_beds"],
                matched_specialties=matched_specs,
                has_blood_stock=has_blood
            )
        )

    # Sort descending by match score
    results.sort(key=lambda x: x.match_score, reverse=True)
    return results
