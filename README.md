# Store Ratings Platform

A web app where users rate stores from 1 to 5. One login, three roles: System
Administrator, Normal User, Store Owner.

- **Backend:** Express + PostgreSQL (`/backend`)
- **Frontend:** React + Vite (`/frontend`)

## 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE store_ratings;
```

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your real values (see "Credentials you need to add" below), then:

```bash
npm run migrate   # creates the users, stores, ratings tables
npm run seed       # creates the first administrator account
npm run dev         # starts the API on http://localhost:5000
```

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev          # starts the app on http://localhost:5173
```

If your API runs somewhere other than `http://localhost:5000/api`, create
`frontend/.env` with:

```
VITE_API_URL=https://your-api-host/api
```

## 4. Log in

Use the administrator email/password you set in `backend/.env` under
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. From there, add store owners and
stores from the Users and Stores screens.

## Credentials you need to add

| Where | Variable | What it is |
|---|---|---|
| `backend/.env` | `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` | Your PostgreSQL connection details |
| `backend/.env` | `JWT_SECRET` | Any long random string, used to sign login sessions |
| `backend/.env` | `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | The first admin account's login (change the password after first login) |
| `backend/.env` | `CLIENT_URL` | Your frontend's URL, for CORS |
| `frontend/.env` (optional) | `VITE_API_URL` | Only needed if the API isn't at `localhost:5000/api` |

Nothing else needs a key — there are no third-party services in this build.
