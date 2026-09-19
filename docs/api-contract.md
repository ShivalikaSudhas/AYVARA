# API Contract Specifications (v1.0)

This document defines the frozen API contract between Frontend (P1) and Backend (P2, P3, P4). All requests accept/return `application/json`. Authenticated routes require `Authorization: Bearer <JWT_TOKEN>`.

---

## 1. Authentication (P2)

### `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "username": "coordinator@cityhospital.org",
    "password": "securepassword"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "usr_123",
      "name": "Dr. Sarah Jenkins",
      "role": "coordinator", // "coordinator" | "dispatcher" | "admin"
      "hospital_id": "hosp_001"
    }
  }
  ```

### `GET /api/v1/auth/me`
- **Response (200 OK)**:
  ```json
  {
    "id": "usr_123",
    "name": "Dr. Sarah Jenkins",
    "role": "coordinator",
    "hospital_id": "hosp_001"
  }
  ```

---

## 2. Hospitals & Resources (P2)

### `GET /api/v1/hospitals`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "hosp_001",
      "name": "City General Hospital",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "total_beds": 120,
      "available_beds": 14,
      "icu_beds_available": 3,
      "status": "normal" // "normal" | "busy" | "critical"
    }
  ]
  ```

### `GET /api/v1/hospitals/{id}`
- **Response (200 OK)**:
  ```json
  {
    "id": "hosp_001",
    "name": "City General Hospital",
    "departments": [
      {
        "id": "dept_icu",
        "name": "Intensive Care Unit",
        "total_beds": 20,
        "available_beds": 3
      }
    ],
    "blood_inventory": {
      "A_positive": 15,
      "O_negative": 4
    }
  }
  ```

### `POST /api/v1/reservations`
- **Request Body**:
  ```json
  {
    "hospital_id": "hosp_001",
    "department_id": "dept_icu",
    "patient_id": "pat_9982",
    "emergency_id": "emg_5541"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "reservation_id": "res_8871",
    "bed_id": "bed_402",
    "status": "reserved",
    "expires_at": "2026-09-19T13:00:00Z"
  }
  ```
- **Response (409 Conflict)**:
  ```json
  {
    "detail": "No available beds matching criteria in selected department."
  }
  ```

---

## 3. Emergency & Matching (P3)

### `POST /api/v1/emergency`
- **Request Body**:
  ```json
  {
    "patient_condition": "Severe Cardiac Arrest",
    "severity": "critical", // "low" | "moderate" | "high" | "critical"
    "latitude": 40.7306,
    "longitude": -73.9352,
    "required_specialties": ["cardiology", "icu"],
    "blood_type_needed": "O_negative"
  }
  ```
- **Response (200 OK — Ranked Matching Results)**:
  ```json
  {
    "emergency_id": "emg_5541",
    "matches": [
      {
        "hospital_id": "hosp_001",
        "hospital_name": "City General Hospital",
        "match_score": 95.4,
        "distance_km": 3.2,
        "available_icu_beds": 3,
        "estimated_eta_minutes": 8
      }
    ]
  }
  ```

### `POST /api/v1/dispatch`
- **Request Body**:
  ```json
  {
    "emergency_id": "emg_5541",
    "selected_hospital_id": "hosp_001",
    "ambulance_unit": "AMB-04"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "dispatch_id": "dsp_1029",
    "status": "en_route",
    "reservation_id": "res_8871"
  }
  ```

---

## 4. Realtime, Disaster & QR (P4)

### `POST /api/v1/disaster/toggle`
- **Request Body**:
  ```json
  {
    "disaster_mode": true,
    "region": "Metro Area",
    "notes": "Mass Casualty Incident - Level 3 Alert"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "activated",
    "timestamp": "2026-09-19T12:45:00Z"
  }
  ```

### `POST /api/v1/qr/verify`
- **Request Body**:
  ```json
  {
    "qr_code_payload": "RES-8871-HOSP001-PAT9982"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "verified": true,
    "reservation_id": "res_8871",
    "patient_id": "pat_9982",
    "hospital_name": "City General Hospital",
    "bed_number": "ICU-04"
  }
  ```

---

## 5. Socket.IO Event Schema (P4 ↔ P1)

| Event Name | Direction | Payload Example |
|---|---|---|
| `bed_update` | Server → Client | `{"hospital_id": "hosp_001", "dept_id": "dept_icu", "available_beds": 2}` |
| `emergency_alert` | Server → Client | `{"emergency_id": "emg_5541", "severity": "critical", "eta": 8}` |
| `disaster_activated`| Server → Client | `{"disaster_mode": true, "notes": "Mass Casualty Incident"}` |
