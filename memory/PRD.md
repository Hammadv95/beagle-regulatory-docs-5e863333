# Beagle Regulatory Docs - PRD

## Original Problem Statement
Update the Admin upload flow to support selecting a document type and send `doc_type` to the backend.

## Architecture
- **Frontend**: React with shadcn/ui components
- **Backend**: FastAPI with MongoDB
- **API**: `/api/admin/upload` endpoint with FormData

## What's Been Implemented (Jan 2026)
- [x] Created `/app/frontend/src/lib/api.js` with `adminUpload` function
- [x] Created `/app/frontend/src/pages/AdminUpload.jsx` with document type dropdown
- [x] Updated `/app/frontend/src/App.js` with admin upload route
- [x] Added `/api/admin/upload` backend endpoint accepting `doc_type`
- [x] Document types: `state_regulation` (default), `pms_report_requests`

## User Flow
1. Navigate to `/admin/upload`
2. Enter document title (required)
3. Select document type from dropdown
4. Choose PDF file (required)
5. Optional: Add slug and summary
6. Submit form

## API Specification
```
POST /api/admin/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

FormData:
- title: string (required)
- pdf: File (required)
- doc_type: "state_regulation" | "pms_report_requests" (default: state_regulation)
- slug: string (optional)
- summary: string (optional)
```

## Testing Status
- Backend: 100% passed
- Frontend: 100% passed

## Backlog
- [ ] FAQ section (user mentioned for later)

## P1 Items
- FAQ section implementation
