# AYVARA — Smart Hospital Resource Coordination Platform (H4 — Versathon 2.0)

A real-time, multi-hospital emergency resource coordination and decision-support system designed to eliminate fragmented communication, secondary transfer delays, and critical resource race conditions during medical emergencies.

---

## 1. System Overview & Purpose

### Problem Context
During regional medical emergencies, EMT dispatchers and hospital staff face significant challenges due to isolated databases, lack of real-time multi-hospital visibility, and delayed ambulance routing. Standard nearest-hospital routing often sends critical patients to nearby facilities with zero available ICU beds or depleted blood stock, forcing emergency re-routing while patient condition deteriorates.

### Solution Architecture
This platform acts as an active coordination and decision-support engine. It evaluates incoming emergency triage requirements against connected hospitals using a multi-factor spatial algorithm, executes atomic bed reservations, coordinates ambulance dispatches, and manages inter-hospital patient transfers in real time.

---

## 2. Technical Architecture & End-to-End Workflow Pipeline

```text
[ Citizen SOS / Triage Intake ]
               │
               ▼
[ P3 Multi-Factor Smart Matching Engine ]
               │
               ▼
[ Atomic Bed Reservation (PostgreSQL Locking) ]
               │
               ▼
[ Ambulance Unit Dispatch & Routing ]
               │
               ▼
[ Inter-Hospital Patient Transfer Engine ]
               │
               ▼
[ Arrival Verification & QR Code Handover ]
               │
               ▼
[ Bed Status Conversion: RESERVED ──> OCCUPIED ]
```

---

## 3. Technology Stack

### Frontend Architecture
* **Core Framework:** React 18, Vite 5, TypeScript
* **Styling System:** Tailwind CSS v4
* **Data Visualization & Mapping:** Recharts (Surge Trends & Analytics), Leaflet (Hospital Spatial Coordinates)
* **HTTP Client & State:** Axios, React Context API (`AuthContext`)

### Backend Architecture
* **API Engine:** FastAPI (Python 3.10+), Uvicorn ASGI
* **Validation Core:** Pydantic v2 (Rust-backed validation engine)
* **ORM & Database:** SQLAlchemy 2.0, Alembic Database Migrations, PostgreSQL (Neon DB) / SQLite
* **Authentication:** PyJWT (JSON Web Tokens), Passlib (Bcrypt password hashing)
* **Real-time Protocol:** WebSockets (`python-socketio`)

---

## 4. Team Ownership & Role Allocation

| Role Track | Owner / Scope | Key Responsibilities & Module Ownership |
| :--- | :--- | :--- |
| **P1 – Frontend & Command Center** | `frontend/**` | React Command Center UI, hospital capacity tables, navigation sidebar, theme setup. |
| **P2 – Core Data & Database** | `backend/app/models/**`, `alembic/**` | PostgreSQL database schema (`Hospital`, `Bed`, `Resource`, `BloodInventory`, `User`), database migrations, atomic locking. |
| **P3 – Intelligence & Workflow Engine (Lead)** | `backend/app/services/matching.py`<br>`backend/app/api/{emergency,dispatch,transfers,analytics}.py` | **Multi-Factor Smart Matching Engine** (Distance 35%, ICU/Beds 35%, Specialties 15%, Blood Stock 15%), emergency triage endpoints, ambulance dispatch routing, inter-hospital transfer engine, utilization analytics. |
| **P4 – Realtime & Platform Integration** | `backend/app/websocket/**`, `scripts/**` | Socket.IO event broadcasting, Disaster Mode surge protocol, QR code handover generation, database seeding & simulation scripts. |

---

## 5. Complete Repository Folder Tree

```text
smart-hospital-coordination/
├── .env                                 # Environment configuration (DB URL, JWT Secret)
├── .env.example                         # Template environment file
├── .gitignore                           # Git ignore rules for secrets and build outputs
├── README.md                            # Main project documentation
├── rules-and-roles.md                   # Governance and ownership map
│
├── backend/                             # FastAPI Backend Application
│   ├── alembic/                         # Database schema migrations
│   ├── app/
│   │   ├── main.py                      # FastAPI application entry point & router definitions
│   │   ├── config.py                    # Environment configuration loader
│   │   ├── api/                         # REST API Endpoints
│   │   │   ├── auth.py                  # POST /auth/login (JWT Token Issuance)
│   │   │   ├── citizen_reports.py       # Public POST /citizen-report (Rate-Limited) & Confirm
│   │   │   ├── emergency.py             # POST /emergency/create-and-match (P3 Matching Engine)
│   │   │   ├── dispatch.py              # Ambulance unit dispatch & status lifecycle
│   │   │   ├── transfers.py             # Inter-hospital patient transfer workflow
│   │   │   ├── analytics.py             # Capacity utilization & demand trends
│   │   │   ├── hospitals.py             # Hospital facility management CRUD
│   │   │   ├── beds.py                  # Bed inventory management
│   │   │   ├── blood.py                 # Blood stock management
│   │   │   ├── departments.py           # Department CRUD
│   │   │   ├── disaster.py              # Disaster Mode surge toggle
│   │   │   ├── notifications.py         # System alerts & notification persistence
│   │   │   └── qr.py                    # Arrival QR code generation & verification
│   │   ├── core/
│   │   │   └── security.py              # Bcrypt password hashing & JWT token encoding/decoding
│   │   ├── database/
│   │   │   ├── connection.py            # SQLAlchemy Engine & Base model class
│   │   │   └── session.py               # SessionLocal factory & get_db dependency
│   │   ├── models/                      # SQLAlchemy ORM Database Models
│   │   │   ├── hospital.py              # Hospital facility schema
│   │   │   ├── department.py            # Department schema
│   │   │   ├── bed.py                   # Bed inventory schema
│   │   │   ├── resource.py              # Ventilator & oxygen resource schema
│   │   │   ├── blood_inventory.py       # Blood inventory schema
│   │   │   ├── emergency_request.py     # Emergency triage request schema
│   │   │   ├── user.py                  # User authentication & role schema
│   │   │   └── citizen_report.py        # Public citizen report schema
│   │   ├── schemas/                     # Pydantic Request/Response DTOs
│   │   └── services/                    # Business & Algorithmic Logic
│   │       ├── matching.py              # P3 Multi-Factor Weighted Matching Algorithm
│   │       ├── forecasting.py           # Predictive demand forecasting service
│   │       ├── disaster_mode.py         # Surge protocol escalation service
│   │       ├── qr_service.py            # Arrival QR payload generator
│   │       └── notification_service.py  # Event notification service
│   └── scripts/
│       ├── seed_database.py             # Database seed script (10 Karnataka Hospitals, 14 Users)
│       └── simulate_emergency.py        # Standalone emergency scenario simulation script
│
└── frontend/                            # React + Vite + TypeScript Frontend
    ├── index.html                       # HTML entry point
    ├── vite.config.ts                   # Vite build configuration (Tailwind v4)
    └── src/
        ├── App.tsx                      # Router configuration & protected route wrappers
        ├── index.css                    # Tailwind CSS v4 stylesheet
        ├── context/
        │   └── AuthContext.tsx          # JWT Auth state & role authorization provider
        ├── components/
        │   └── common/
        │       ├── Sidebar.tsx          # Navigation sidebar component
        │       └── ProtectedRoute.tsx   # Role-scoped route guard
        ├── pages/
        │   ├── Dashboard.tsx            # Live Command Center Resource Dashboard
        │   ├── Emergency.tsx            # Emergency Triage & Smart Match Result View
        │   ├── Transfers.tsx            # Inter-Hospital Patient Transfer Queue
        │   ├── Analytics.tsx            # Capacity Utilization & Demand Surge Analytics
        │   ├── Hospitals.tsx            # Hospital Directory & Resource View
        │   ├── Login.tsx                # Role-Scoped Authentication Login Page
        │   ├── PublicSOS.tsx            # Unauthenticated Public Emergency SOS Form
        │   ├── AdminDashboard.tsx       # Cross-Hospital Governance & Disaster Mode Console
        │   ├── CoordinatorDashboard.tsx # Hospital-Scoped Capacity Management Portal
        │   └── DispatcherConsole.tsx    # Regional Dispatcher Command & SOS Confirmation Console
        └── services/
            └── api.ts                   # Axios API client service layer
```

---

## 6. Primary Interfaces & Role Portals

### Interface 1: Public Citizen SOS Portal (`/sos`)
* **Access Level:** Public (No login required)
* **Features:**
  * Simple emergency reporting form accepting incident description, contact phone number, and GPS coordinates.
  * Auto-detect GPS button utilizing browser Geolocation API.
  * Connects to `POST /api/v1/citizen-report` with sliding-window IP rate limiting (max 5 submissions per minute).
  * Writes report with status `PENDING` to prevent public input from directly corrupting core emergency request data.

### Interface 2: Regional Dispatcher Command Console (`/dispatcher`)
* **Access Level:** Protected (`dispatcher` role)
* **Features:**
  * **Unconfirmed Citizen SOS Queue:** Review pending reports from the public portal, verify details, and convert valid reports into official emergency requests.
  * **Triage Intake & Smart Match Execution:** Input patient condition, triage priority, required specialties, and blood type.
  * Triggers the P3 Smart Matching Engine (`POST /emergency/create-and-match`) to display ranked hospitals with Match Score %, Distance in KM, ETA, and Blood Stock status.
  * **Ambulance Unit Dispatch:** Assign ALS ambulance units to matched facilities.

### Interface 3: Hospital Coordinator Portal (`/coordinator`)
* **Access Level:** Protected (`coordinator` role, scoped to specific `hospital_id`)
* **Features:**
  * Displays hospital-scoped capacity metrics (Available Beds, ICU Beds, Ventilator units, Blood stock levels).
  * **Incoming Transfer Queue:** Review and approve incoming inter-hospital patient transfer requests targeted at the coordinator's facility.
  * Manual bed inventory status updates (`AVAILABLE` $\rightarrow$ `OCCUPIED` / `RESERVED`).

### Interface 4: Admin Control Console (`/admin`)
* **Access Level:** Protected (`admin` role)
* **Features:**
  * Regional cross-hospital overview monitoring all 10 connected facilities.
  * **Mass Casualty Disaster Mode Toggle:** Single-click activation that broadcasts a high-priority surge alert across all connected clients and expands capacity threshold limits.
  * **HMIS Gateway Sync Trigger:** Triggers synchronization with state healthcare registry databases.

### General Command Center Dashboard (`/dashboard`)
* **Access Level:** Authenticated
* **Features:**
  * Real-time stat cards (Total Available Beds, Online Hospitals, Active Emergencies, Ambulances).
  * Hospital Resource Capacity table featuring color-coded occupancy progress bars (Green <80%, Orange 80-90%, Red >90%).
  * Live System Activity Log recording bed reservations, dispatches, and capacity changes.

---

## 7. How to Run and Verify the Project

### 1. Backend Application Setup
```powershell
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database seed script (Populates 10 Karnataka hospitals & 14 accounts)
python scripts/seed_database.py

# Start FastAPI application server
uvicorn app.main:app --reload --port 8000
```
Backend Swagger API Documentation available at: `http://localhost:8000/docs`

### 2. Standalone Emergency Scenario Simulation Script
Run the automated rehearsal script to verify the end-to-end emergency pipeline independently of the frontend UI:
```powershell
python backend/scripts/simulate_emergency.py
```

### 3. Frontend Application Setup
```powershell
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend Application available at: `http://localhost:5173`

---

## 8. Pre-Seeded Demonstration Credentials

| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `admin123` | Global Cross-Hospital Access, Disaster Mode, HMIS Sync |
| **Hospital Coordinator** | `coordinator_1` | `coord123` | Scoped to KMC Hospital Mangaluru (`hosp_001`) |
| **Hospital Coordinator** | `coordinator_2` | `coord123` | Scoped to AJ Hospital & Research Centre (`hosp_002`) |
| **Regional Dispatcher** | `dispatcher_1` | `dispatch123` | Regional Emergency Triage, Matching, Dispatch, Citizen Reports |
| **Public Citizen** | *None* | *None* | Accessible at `/sos` (Unauthenticated) |
