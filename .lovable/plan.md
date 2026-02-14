
# Docs Platform Frontend

A modern, polished frontend for your existing FastAPI docs backend, built with React + Vite + React Router + Tailwind CSS.

## Environment Setup
- API base URL configured via environment variable pointing to `https://docs-website-production.up.railway.app`
- All API calls use this base URL

## Pages

### 1. Home Page (`/`)
- **Header** with "Docs" branding
- **Search bar** prominently placed at the top
- Initially loads all docs via `GET /api/docs`
- Typing in search calls `GET /api/search?q=...` with debouncing
- Results displayed as **polished cards** showing title, summary, and formatted date
- Clicking a card navigates to the doc detail page
- Loading skeletons and error states

### 2. Doc Detail Page (`/docs/:slug`)
- Fetches doc metadata via `GET /api/docs/{slug}`
- Displays title, summary, and formatted updated date
- **Embedded PDF viewer** using an iframe pointing to the backend's `/api/docs/{slug}/view` endpoint
- "Open PDF in new tab" button
- Back navigation to home

### 3. Admin Login Page (`/admin`)
- Clean login form with email and password fields
- Submits to `POST /admin/login` as `x-www-form-urlencoded`
- Saves JWT token to `localStorage`
- Redirects to upload page on success
- Error handling for invalid credentials

### 4. Admin Upload Page (`/admin/upload`)
- **Auth guard**: redirects to `/admin` if no token in localStorage
- Upload form with fields: title (required), slug (optional), summary (optional), PDF file (required)
- PDF-only file validation
- Submits as `multipart/form-data` to `POST /admin/upload` with Bearer token
- Success message with link to the newly uploaded doc
- **Logout button** that clears token and redirects to login

## Design & UX
- Modern, polished look with subtle shadows, rounded cards, smooth hover transitions
- Fully mobile responsive
- Loading skeletons on all data-fetching pages
- Toast notifications for success/error feedback
- Clean typography and generous whitespace
