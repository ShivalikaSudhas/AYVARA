# Smart Hospital Resource Coordination (H4) — Versathon 2.0

Real-time multi-hospital emergency resource coordination platform.
EMT Dispatch → Emergency Alert → Matching → Atomic Bed Reservation → Socket.IO Broadcast → QR Handover → Arrival

## Stack
Frontend: Vite + React + TypeScript + Tailwind + Leaflet + Recharts + Socket.IO client + Axios
Backend: FastAPI + SQLAlchemy + Pydantic v2 + Alembic + python-socketio
DB: PostgreSQL (Neon)
Auth: JWT + role-based access
Deploy: Vercel (frontend) / Render (backend) / Neon (DB)

## Team & Ownership
| Role | Owner | Scope |
|---|---|---|
| P1 – Frontend & Command Center | | React, Tailwind, Leaflet, Recharts, Socket.IO client |
| P2 – Core Data & CRUD | | PostgreSQL, models, migrations, atomic reservation txns |
| P3 – Intelligence & Workflow | | Emergency API, matching engine, forecasting |
| P4 – Platform & Realtime | | Socket.IO server, Disaster Mode, QR, simulator |

## Setup
1. `cp .env.example .env` — fill DB URL, JWT secret
2. Backend: `cd backend && pip install -r requirements.txt && alembic upgrade head && python scripts/seed_database.py`
3. Frontend: `cd frontend && npm install`
4. Run: backend `cd backend && uvicorn app.main:app --reload` | frontend `cd frontend && npm run dev`

## API Contract
See `docs/api-contract.md` — frozen at Hour 1. Do not change without notifying all leads.

## Integration Checkpoints
Hour 6 DB↔Backend | Hour 8 Backend↔Frontend | Hour 10 Emergency↔Matching↔DB | Hour 12 Full vertical slice | Hour 16 Demo flow complete | Hour 20 Concurrency verified | Hour 24 Deploy + demo

## Definition of Done (V1 / PS-mandatory)
- [ ] Resource availability dashboard
- [ ] Hospital/department management
- [ ] Emergency request workflow
- [ ] Real-time status updates & notifications (persisted)
- [ ] Demand/utilization analytics (needs resource_snapshots history)
- [ ] Atomic bed reservation, 409 on conflict
- [ ] JWT login + role scoping

## Non-Negotiable Rule
No one builds their module in isolation past the assigned checkpoint hour. Integrate first, polish later.
