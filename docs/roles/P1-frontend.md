# P1 — Frontend & Command Center

## Owned Files
- `frontend/**` (pages, components, hooks, services, utils, config, styles)

## Do NOT Touch
- Any file under `backend/`

## Hour-by-Hour Deliverables
- H1: Vite + React + Tailwind + React Router scaffold, auth context, Axios client configured
- H2–4: Login page, Dashboard shell, Sidebar/Navbar, protected route wrapper
- H5–6: Hospital list + detail pages, department/bed tables wired to P2 CRUD endpoints
- H7–8: **Checkpoint — Backend↔Frontend integration demo working**
- H9–10: Emergency request form, dispatch status panel, matching results view
- H11–12: **Checkpoint — Full vertical slice (emergency→match→reserve→update)**
- H13–14: Leaflet map (hospital markers, ambulance routes), resource heatmap overlay
- H15–16: **Checkpoint — Demo flow complete**, Socket.IO client hooks consuming P4 events
- H17–18: Recharts analytics (utilization trends, blood stock, response times)
- H19–20: **Checkpoint — Concurrency verified**, optimistic UI + 409 conflict handling
- H21–22: Polish — responsive layout, loading states, error toasts, dark mode toggle
- H23–24: **Deploy to Vercel, final demo run**

## Dependencies
- P2: CRUD endpoints live by H6 (hospitals, departments, beds, resources, blood)
- P3: Emergency + dispatch + matching endpoints live by H10
- P4: Socket.IO events emitting by H12, QR component data contract by H14

## Integration Checkpoints
- H8: Backend↔Frontend | H12: Vertical slice | H16: Demo flow | H24: Deploy

## Definition of Done (P1-relevant)
- [ ] Resource availability dashboard
- [ ] Hospital/department management UI
- [ ] Emergency request workflow UI
- [ ] Real-time status updates via Socket.IO client
- [ ] Demand/utilization analytics (Recharts)
- [ ] JWT login + role-scoped route guards
