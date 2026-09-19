# P2 — Core Data & CRUD

## Owned Files
- `backend/app/models/**`, `backend/app/schemas/**`, `backend/app/database/**`
- `backend/app/core/security.py`, `backend/app/config.py`, `backend/app/main.py`, `backend/app/api/__init__.py`
- `backend/app/api/{auth,hospitals,departments,beds,resources,blood}.py`, `backend/app/services/reservation.py`
- `backend/alembic/**`, `backend/scripts/seed_database.py`

## Do NOT Touch
- `frontend/**`
- `backend/app/services/{matching,forecasting,disaster_mode,qr_service,notification_service}.py`
- `backend/app/websocket/**`

## Hour-by-Hour Deliverables
- H1: Neon DB provisioned, SQLAlchemy engine + session, `alembic init`, base model class
- H2–3: All 11 models defined, initial migration
- H4–5: Pydantic v2 schemas, CRUD routers for hospitals/departments/beds/resources/blood
- H6: **Checkpoint — DB↔Backend**, seed script (3+ hospitals), JWT auth (`/auth/login`, `/auth/me`)
- H7–8: Atomic bed reservation (`SELECT … FOR UPDATE SKIP LOCKED`), 409 on conflict
- H9–10: `resource_snapshots` history insert, blood inventory decrement/restock
- H11–12: **Checkpoint — Full vertical slice**, reservation works with P3 matching
- H13–16: Notification persistence, transfers CRUD, analytics aggregation queries
- H17–20: **Checkpoint — Concurrency verified** (parallel reservation stress test passes)
- H21–24: Index tuning, edge-case errors, **deploy DB to Neon, seed prod data**

## Dependencies
- P3: Model fields/schema approved before matching queries | P4: Notification schema by H5

## Integration Checkpoints
- H6: DB↔Backend | H12: Vertical slice | H20: Concurrency verified | H24: Deploy

## Definition of Done (P2-relevant)
- [ ] Hospital/department management (models + CRUD)
- [ ] Atomic bed reservation, 409 on conflict
- [ ] JWT login + role scoping (`get_current_user` dependency)
- [ ] Resource snapshots history for analytics
- [ ] Notification persistence
