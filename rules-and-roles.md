# Team Rules & Role-Based Access

## Mandatory Setup Workflow (Before Writing Code)
1. Clone repo & set up env: `cp .env.example .env`
2. Install required dependencies:
   - **Backend (P2, P3, P4)**: `cd backend && pip install -r requirements.txt`
   - **Frontend (P1)**: `cd frontend && npm install`
3. Verify local dev environment runs cleanly (`uvicorn app.main:app --reload` / `npm run dev`).
4. Read your role specification file under `docs/roles/` before starting work.

## General Rules
1. No domain logic written before hackathon start — scaffolding only. Commit timestamps are audited.
2. API contract (`docs/api-contract.md`) is frozen after Hour 1. Breaking changes require a message to all 4 leads before pushing.
3. No one works on another person's owned files without a heads-up — check Ownership Map below first.
4. Every push that changes a shared contract (schema, socket event, API route) must be announced in team chat immediately.
5. Seed data and mock JSON take priority over waiting for a dependency — never sit idle blocked on another person's endpoint.
6. Stop feature work at assigned integration checkpoints until that checkpoint's demo works end-to-end.
7. No new major features after Hour 22 (freeze). Bug fixes and polish only.
8. If behind schedule, drop in this order: Forecasting → Disaster Mode → HMIS sync → QR polish → Analytics extras. Never drop: atomic reservation, core emergency flow, auth.

## Role-Based Work & Access

| | P1 Frontend | P2 Data/CRUD | P3 Intelligence | P4 Realtime/Demo |
|---|---|---|---|---|
| **Owns** | React pages/components, Leaflet, Recharts, socket client hooks | DB models, migrations, hospital/dept/bed/resource/blood CRUD, reservation transaction | Emergency API, dispatch API, matching engine, forecasting | Socket.IO server, rooms, Disaster Mode, QR service, notifications, simulator scripts |
| **Can edit** | `frontend/**` | `backend/app/models/**`, `backend/app/schemas/**`, `backend/app/api/{hospitals,departments,beds,resources,blood}.py`, `backend/app/services/reservation.py` | `backend/app/api/{emergency,dispatch,transfers,analytics}.py`, `backend/app/services/{matching,forecasting}.py` | `backend/app/websocket/**`, `backend/app/api/disaster.py`, `backend/app/services/{disaster_mode,qr_service,notification_service}.py`, `scripts/**` |
| **Read-only access to** | All API contract docs, seed data | API contract | DB schema (no direct edits) | DB schema, matching output contract |
| **Must not touch** | Backend files | Frontend files, matching logic | DB models directly (request schema changes via P2) | Frontend files, DB models |
| **App-level access** | No production DB credentials needed — Axios/socket URLs via `.env` only | Full DB credentials (Neon) | Read access to DB via ORM only, no raw creds | Socket server env only |

## Auth Roles (in-app, JWT payload: `{hospital_id, role}`)
- **coordinator** — scoped to own `hospital_id`. Can view/manage own hospital's beds, resources, blood, respond to transfers targeting them.
- **dispatcher/EMT** — can create emergencies and dispatches, view matching results, no hospital-resource write access.
- **admin** — cross-hospital read, can activate Disaster Mode, trigger HMIS sync, run simulator.

Enforce via one FastAPI dependency (`get_current_user`) checked on every hospital-scoped route — never trust a `hospital_id` passed in the request body/path without matching it against the token.
