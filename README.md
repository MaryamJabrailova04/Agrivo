# Agrivo

Full-stack agricultural marketplace platform for buyers, farmers, and logistics partners.

## Project structure

```text
Agrivo/
├── frontend/     # Vite + React SPA
├── backend/    # Node.js + Express + Prisma + PostgreSQL API
├── scripts/      # Data build scripts (Python)
├── guidelines/   # Project guidelines
└── README.md
```

## Quick start

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

API: `http://localhost:5000/api`  
Health: `http://localhost:5000/api/health`

### From repository root (optional)

```bash
npm run install:all
npm run dev:frontend
npm run dev:backend
```

## Documentation

- [Frontend README](frontend/README.md)
- [Backend README](backend/README.md)

## Notes

- `frontend/.env.example` currently uses `VITE_DATA_MODE=api`.
- Set `VITE_DATA_MODE=mock` in `frontend/.env` if you want localStorage/static fallback mode.
- Do not commit `.env` files. Use `.env.example` as templates.
