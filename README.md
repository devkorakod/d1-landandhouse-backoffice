# D1LANDANDHOUSE — Backoffice

React 18 + Vite admin dashboard (CRM/property management) for D1LANDANDHOUSE,
consuming `d1-landandhouse-backend`'s `/api/v1/admin/*` API. Theme: black sidebar,
white content area, red accents.

## Setup

```bash
npm install
cp .env.local.example .env.local   # point VITE_API_URL at the backend
npm run dev                         # http://localhost:5173
```

Log in with the seed Owner account (`SEED_OWNER_EMAIL`/`SEED_OWNER_PASSWORD` from the
backend's `.env`, default `owner@d1landandhouse.co.th` / `ChangeMe123!` — change it
immediately after first login).

## MVP scope

Login (JWT access token in memory + httpOnly refresh cookie), dashboard stat tiles,
property list + create/edit form (with image upload), lead Kanban-lite (status columns,
no drag-and-drop yet), read-only project/promotion lists (the backend CRUD APIs exist,
forms are a follow-up), site settings (contact channels), Owner-only user management.
No article/content management, no audit log viewer, no media library browser yet.

## Branches

`main` (production) / `staging` / `dev` (default working branch).
