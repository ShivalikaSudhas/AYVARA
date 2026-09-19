# P3 — Intelligence & Workflow

## Owned Files
- `backend/app/api/{emergency,dispatch,transfers,analytics}.py`
- `backend/app/services/{matching,forecasting}.py`

## Do NOT Touch
- `frontend/**`, `backend/app/models/**` (request schema changes via P2)
- `backend/app/websocket/**`, `backend/app/services/{disaster_mode,qr_service,notification_service}.py`

## Hour-by-Hour Deliverables
- H1: Review API contract, define matching input/output schema with P2
- H2–4: Emergency request endpoint (`POST /emergency`), dispatch endpoint (`POST /dispatch`)
- H5–6: Matching engine v1 — score by: bed availability, distance, dept capability, resource stock
- H7–8: **Checkpoint — Backend↔Frontend**, matching returns ranked hospital list to P1
- H9–10: **Checkpoint — Emergency↔Matching↔DB**, matching calls P2 reservation txn atomically
- H11–12: **Checkpoint — Full vertical slice**, emergency→match→reserve→dispatch end-to-end
- H13–14: Transfer request/accept/reject workflow (inter-hospital)
- H15–16: **Checkpoint — Demo flow**, analytics endpoints (utilization, response times, blood trends)
- H17–18: Forecasting service (trend-based demand prediction from resource_snapshots)
- H19–20: **Checkpoint — Concurrency verified**, no double-alloc under simultaneous requests
- H21–24: Edge cases (no-match fallback, partial match, priority escalation), **deploy, final demo**

## Dependencies
- P2: Models/schemas by H3, reservation txn by H8, snapshots by H10
- P4: Socket emit after successful match/reservation (coordinate payload by H10)

## Integration Checkpoints
- H8: Backend↔Frontend | H10: Emergency chain | H12: Vertical slice | H20: Concurrency | H24: Deploy

## Definition of Done (P3-relevant)
- [ ] Emergency request workflow (create → match → reserve → dispatch)
- [ ] Matching engine with ranked results
- [ ] Demand/utilization analytics endpoints
- [ ] Transfer workflow (request/accept/reject)
