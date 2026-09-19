# P4 — Platform & Realtime

## Owned Files
- `backend/app/websocket/**`, `backend/app/api/{sync,disaster,notifications}.py`
- `backend/app/services/{disaster_mode,qr_service,notification_service}.py`, `backend/scripts/**`

## Do NOT Touch
- `frontend/**`, `backend/app/models/**`
- `backend/app/services/{matching,reservation,forecasting}.py`, `backend/app/api/{auth,hospitals,departments,beds,resources,blood}.py`

## Hour-by-Hour Deliverables
- H1: python-socketio server mounted on FastAPI ASGI, CORS configured, room join/leave
- H2–4: Event definitions — `bed_update`, `emergency_alert`, `dispatch_update`, `resource_change`, `disaster_activated`
- H5–6: Notification service — persist to DB (P2 model) + emit via socket, read/unread endpoints
- H7–8: **Checkpoint — Backend↔Frontend**, P1 socket client receives test events
- H9–10: Wire socket emits into P3 matching/reservation flow (post-commit hooks)
- H11–12: **Checkpoint — Full vertical slice**, live updates: emergency→match→reserve→socket→UI
- H13–14: QR service — generate QR on reservation (patient ID + bed + hospital), verify endpoint
- H15–16: **Checkpoint — Demo flow**, Disaster Mode toggle (admin-only, broadcasts to all rooms)
- H17–18: Simulator scripts — `simulate_emergency.py`, `simulate_hmis.py`
- H19–20: **Checkpoint — Concurrency verified**, socket broadcasts under load, no dropped events
- H21–24: HMIS sync stub, connection health monitoring, **deploy Socket.IO on Render, final demo**

## Dependencies
- P2: Notification model + schema by H5, DB session access for persistence
- P3: Matching/reservation service calls to trigger socket emits by H10

## Integration Checkpoints
- H8: Backend↔Frontend | H12: Vertical slice | H16: Demo flow + QR | H20: Concurrency | H24: Deploy

## Definition of Done (P4-relevant)
- [ ] Real-time status updates via Socket.IO (bed, emergency, dispatch, resource)
- [ ] Notifications persisted + delivered
- [ ] QR handover generation and verification
- [ ] Disaster Mode activation (admin-only broadcast)
- [ ] Simulator scripts functional for demo
