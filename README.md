# NEXUS RANK — Real-Time Leaderboard System

A production-ready full-stack leaderboard platform demonstrating **PostgreSQL for durable history**, **Redis for in-memory rankings & anti-cheat**, and **Socket.io for sub-second UI updates**. Built as a portfolio-grade Docker Compose stack with a high-end dark metallic UI.

![Stack](https://img.shields.io/badge/Node.js-20-green) ![Stack](https://img.shields.io/badge/React-Vite-61dafb) ![Stack](https://img.shields.io/badge/Redis-7-DC382D) ![Stack](https://img.shields.io/badge/PostgreSQL-15-336791) ![Stack](https://img.shields.io/badge/Docker-Compose-2496ED)

---

## System Architecture

```
┌────────────────────┐     HTTP / WS      ┌─────────────────────┐
│  React + Tailwind  │◄──────────────────►│  Express + Socket.io │
│  nginx :8080       │   /api, /socket.io │  Node.js :5000       │
└────────────────────┘                    └──────────┬──────────┘
                                                     │
                                   ┌─────────────────┴─────────────────┐
                                   ▼                                   ▼
                          ┌─────────────────┐                 ┌─────────────────┐
                          │  PostgreSQL 15  │                 │   Redis 7       │
                          │  Users / Games  │                 │  ZSET rankings  │
                          │  ScoreHistory   │                 │  Username hash  │
                          │  (persistence)  │                 │  Rate limits    │
                          └─────────────────┘                 └─────────────────┘
```

### Why two databases?

| Concern | Store | Why |
|--------|--------|-----|
| Accounts, game catalog, audit trail of every submission | **PostgreSQL** (Prisma) | ACID durability, relational integrity |
| Live top-N ranks, username resolution, request throttling | **Redis** | O(log N) sorted sets, microsecond reads, atomic ops |

The leaderboard **read path never touches Postgres**. Usernames live in a Redis Hash (`users:usernames`) so `GET /api/leaderboard` stays entirely in memory.

---

## Redis Architecture (Senior Patterns)

### 1. Redis-only leaderboard lookup

On **register** and **login**, the API writes:

```
HSET users:usernames <userId> <username>
```

Fetching the top 10:

1. `ZREVRANGE leaderboard:global 0 9 WITHSCORES` → ordered `userId` + scores  
2. Pipelined `HMGET users:usernames id1 id2 …` → usernames in one RTT  
3. Assemble `{ rank, userId, username, score }[]` — **zero SQL**

### 2. Atomic high-score updates (`ZADD GT`)

Score submissions use Redis 7’s conditional add:

```js
await redis.zadd('leaderboard:global', 'GT', score, userId);
```

Redis atomically updates the member **only when the new score is greater** than the existing one. No race-prone read-modify-write in application code.

Every submission is still appended to Postgres `ScoreHistory` for analytics/audit, even if it did not beat the personal best.

### 3. Bulletproof rate limiter (no zombie keys)

Users may submit **at most 3 scores per 10 seconds**. Middleware runs:

```js
const pipeline = redis.pipeline();
pipeline.incr(`ratelimit:score:${userId}`);
pipeline.expire(`ratelimit:score:${userId}`, 10, 'NX');
await pipeline.exec();
```

- `INCR` + `EXPIRE NX` in one pipeline → atomic window start  
- `NX` sets TTL **only if the key has no expiry** → prevents keys without TTL after crashes/restarts  
- Exceeding the limit returns **`429 Too Many Requests`**

---

## Real-Time WebSocket Flow

```
Client A                  Backend                     Redis / Postgres              Client B
   │                         │                              │                          │
   │  POST /api/scores       │                              │                          │
   │────────────────────────►│  rate limit (INCR/EXPIRE)    │                          │
   │                         │─────────────────────────────►│                          │
   │                         │  INSERT ScoreHistory         │                          │
   │                         │─────────────────────────────►│                          │
   │                         │  ZADD GT + ZREVRANGE/HMGET   │                          │
   │                         │─────────────────────────────►│                          │
   │                         │                              │                          │
   │◄── 201 + leaderboard ───│                              │                          │
   │                         │  emit leaderboard_update     │                          │
   │◄────────────────────────┼─────────────────────────────────────────────────────────►│
   │   (glow animation)      │                              │          (re-render)     │
```

On connect, each socket also receives the current top 10 so late joiners sync immediately.

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Create user, cache username in Redis, return JWT |
| `POST` | `/api/auth/login` | — | Verify credentials, refresh Redis username hash, return JWT |
| `GET` | `/api/games` | JWT | List seeded games |
| `POST` | `/api/scores` | JWT + rate limit | Persist history, `ZADD GT`, broadcast top 10 |
| `GET` | `/api/leaderboard` | — | Top 10 from Redis only |
| `GET` | `/api/leaderboard/me` | JWT | Caller’s `ZREVRANK` + `ZSCORE` |
| `GET` | `/api/health` | — | Liveness probe |

Socket event: **`leaderboard_update`** → `{ leaderboard: [{ rank, userId, username, score }] }`

---

## Tech Stack

**Backend:** Node.js 20, Express, Prisma, PostgreSQL 15, Redis 7 (`ioredis`), Socket.io, JWT (`jsonwebtoken`), bcrypt  

**Frontend:** React 18, Vite, Tailwind CSS, HashRouter (Electron-ready), axios, socket.io-client  

**Infra:** Docker Compose (4 services), multi-stage frontend → `nginx:alpine`

Electron readiness:

- `HashRouter` (works with `file://` and packaged apps)
- `VITE_API_URL` / `VITE_SOCKET_URL` abstracted in `frontend/src/config.js`

---

## Quick Start (Docker)

### Prerequisites

- Docker Desktop (or Docker Engine + Compose v2)

### Launch

```bash
cd realtime-redis-leaderboard
cp .env.example .env
# Edit .env — replace every CHANGE_ME (Postgres user/password, JWT_SECRET, DATABASE_URL)
docker-compose up -d --build
```

`DATABASE_URL` must use the same user/password you set in `POSTGRES_USER` / `POSTGRES_PASSWORD`.

Services:

| Service | URL / Port |
|---------|------------|
| Frontend (nginx) | http://localhost:8080 |
| Backend API | http://localhost:5000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

The backend container waits for healthy Postgres & Redis, then runs:

1. `prisma migrate deploy`  
2. `prisma db seed` (3 sample games)  
3. `node src/index.js`

Open **http://localhost:8080**, register an account, pick a game, and spam “Simulate Score” to see rate limiting, glowing rank shifts, and live multi-tab sync.

### Tear down

```bash
docker-compose down
# wipe persisted DB volume:
docker-compose down -v
```

---

## Local Development (optional)

```bash
# Terminal 1 — infra only
docker-compose up -d postgres-db redis-cache

# Terminal 2 — API
cd backend
cp ../.env.example ../.env   # point DATABASE_URL/REDIS_URL at localhost
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev

# Terminal 3 — UI
cd frontend
npm install
npm run dev
# → http://localhost:5173 (Vite proxies /api and /socket.io → :5000)
```

Update `.env` for local API (use your own credentials, not placeholders):

```
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/leaderboard_db?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-long-random-secret
CORS_ORIGIN=http://localhost:5173
```

---

## Project Structure

```
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   └── src/
│       ├── index.js              # HTTP + Socket.io bootstrap
│       ├── app.js                # Express routes
│       ├── config/               # env, prisma, redis
│       ├── middleware/           # JWT auth, Redis rate limit
│       ├── routes/               # auth, games, scores, leaderboard
│       └── services/             # Redis leaderboard service
└── frontend/
    ├── Dockerfile                # multi-stage Vite → nginx
    ├── nginx.conf                # SPA + /api + /socket.io proxy
    └── src/
        ├── api/                  # axios client
        ├── socket/               # socket.io-client singleton
        ├── context/              # AuthProvider
        ├── components/           # Leaderboard, PersonalPanel, …
        └── pages/                # Login, Register, Dashboard
```

---

## UI Design Language

- **Baseline:** deep blacks / gunmetal surfaces  
- **Metal:** silver borders, inset sheen, glassmorphism panels  
- **Accents:** neon blue → purple → cyan gradients on CTAs and live states  
- **Motion:** `glow-pulse` CSS animation when a row’s score or rank changes via WebSocket  

---

## Security Notes

- Passwords hashed with **bcrypt** (cost 12)  
- JWT Bearer auth on protected routes  
- Redis rate limiting on score writes (anti-bot / anti-spam)  
- `.env.example` only contains `CHANGE_ME` placeholders — never real secrets
- Put real credentials only in local `.env` (gitignored) before any deploy  

---
