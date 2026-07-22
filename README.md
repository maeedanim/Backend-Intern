<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">Dev Community — Backend API</h1>

<p align="center">
  A developer social community REST API built with NestJS · TypeScript · MongoDB · Redis · BullMQ
</p>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Core Business Logic](#core-business-logic)
- [External Integrations](#external-integrations)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [Running Locally](#running-locally)
- [Running Tests](#running-tests)
- [Known Issues & Risks](#known-issues--risks)

---

## Overview

**Dev Community** is a backend API for a developer-focused social platform where developers can:

- Register and authenticate with JWT
- Publish posts (time-gated to 9 AM – 10 PM Asia/Dhaka)
- Comment and reply on posts
- React (like/dislike) to posts, comments, and replies
- Receive email notifications on key events (signup, comments, excessive dislikes)
- Browse a ranked feed sorted by engagement (reactions + comments)

A Swagger UI is available at `http://localhost:3000/api` after startup.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5.7 |
| Runtime | Node.js |
| Framework | NestJS 11 |
| HTTP Adapter | Express (`@nestjs/platform-express`) |
| Database | MongoDB via Mongoose 8 |
| Auth | JWT (`@nestjs/jwt`) + bcrypt |
| Job Queue | BullMQ + Redis |
| Caching | `@nestjs/cache-manager` (Redis-backed) |
| Redis Client | ioredis + `@nestjs-modules/ioredis` |
| Scheduling | `@nestjs/schedule` (cron jobs) |
| Email | `@nestjs-modules/mailer` + Nodemailer (Gmail SMTP) |
| Validation | `class-validator` + `class-transformer` |
| API Docs | Swagger (`@nestjs/swagger`) |

---

## Architecture

**Single-process layered monolith** following standard NestJS module conventions:

```
HTTP Request
    └── Controller  (routing, request/response shaping)
          └── Guard(s)  (JWT auth · rate-limit · posting-window)
                └── Service  (business logic)
                      └── Model  (MongoDB via Mongoose)
```

Background work (email sending) is decoupled via a **BullMQ queue**. The main process both enqueues jobs (via `MailService`) and processes them (via `MailProcessor`) — there is no separate worker binary.

```
┌─────────────┐      HTTP       ┌──────────────────┐
│   Client    │ ─────────────▶ │   NestJS API     │
└─────────────┘                 │   (port 3000)    │
                                └────────┬─────────┘
                                         │
                        ┌────────────────┼────────────────┐
                        ▼                ▼                ▼
                   ┌─────────┐    ┌──────────┐    ┌───────────┐
                   │ MongoDB │    │  Redis   │    │  BullMQ   │
                   │ dev_comm│    │ :6379    │    │ mail queue│
                   └─────────┘    └──────────┘    └─────┬─────┘
                                                         │
                                                   ┌─────▼──────┐
                                                   │MailProcessor│
                                                   │ (in-process)│
                                                   └─────┬───────┘
                                                         │
                                                   ┌─────▼───────┐
                                                   │ Gmail SMTP  │
                                                   └─────────────┘
```

---

## Project Structure

```
src/
├── main.ts                        # Application entry point
├── app.module.ts                  # Root module — wires everything together
│
├── auth/                          # Registration, login, JWT, refresh tokens
│   ├── Dtos/                      # createUserDto · loginUserDto · refreshTokenDto
│   ├── Schemas/refreshToken.entity.ts
│   └── guards/auth.guard.ts       # JWT Bearer guard
│
├── user/                          # User profile read/update/delete
│   ├── Dtos/updateUserDto.ts
│   └── Schemas/user.entity.ts
│
├── post/                          # Post CRUD + aggregated reads + ranked feed
│   ├── Dtos/
│   ├── Schemas/post.entity.ts
│   ├── post-aggregate.interface.ts
│   └── posting-window/            # Time-gated posting (cron + guard)
│       └── guards/
│           ├── postingWindow.guard.ts
│           └── rateLimit.guard.ts
│
├── comment/                       # Comment CRUD + BullMQ notification dispatch
│   ├── Dtos/
│   └── schema/comment.entity.ts
│
├── reply/                         # Reply CRUD
│   ├── Dtos/
│   └── Schemas/reply.entity.ts
│
├── reaction/                      # Toggle like/dislike on Post | Comment | Reply
│   ├── Dtos/
│   ├── Schemas/reaction.entity.ts
│   └── reaction-type.enum.ts
│
├── mail/                          # BullMQ queue + email processor
│   ├── mail.module.ts
│   ├── mail.service.ts            # Enqueues jobs
│   └── mail.processor.ts          # Consumes jobs & sends emails
│
├── common/
│   ├── decorators/rate-limit.decorator.ts
│   └── redis/redis.module.ts      # Global ioredis connection
│
├── config/config.ts               # Maps env vars to nested config keys
└── interfaces/
    └── jwt-payload.interface.ts
```

---

## API Endpoints

All protected endpoints require `Authorization: Bearer <access_token>`.

### Auth — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | ❌ | Register a new developer |
| POST | `/auth/login` | ❌ | Login, returns `accessToken` + `refreshToken` |
| POST | `/auth/refresh` | ✅ | Refresh tokens using a valid refresh token |

### Users — `/user`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/user` | ✅ | List all developers |
| GET | `/user/:id` | ✅ | Get a developer by ID |
| PATCH | `/user/:id` | ✅ (owner) | Update skill & experience |
| DELETE | `/user/:id` | ✅ (owner) | Delete own account |

### Posts — `/post`

| Method | Path | Auth | Guards | Description |
|---|---|---|---|---|
| GET | `/post` | ✅ | — | All posts (fully aggregated with comments/replies/reactions) |
| GET | `/post/ranked` | ✅ | — | Top N posts by engagement score (cached 30s) |
| GET | `/post/:id` | ✅ | — | Single post (fully aggregated) |
| POST | `/post` | ✅ | PostingWindow · RateLimit | Create a post (max 5/hr, 9AM–10PM only) |
| PATCH | `/post/:id` | ✅ (owner) | — | Update post title/description |
| DELETE | `/post/:id` | ✅ (owner) | — | Delete a post |

### Comments — `/comment`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/comment` | ✅ | All comments |
| GET | `/comment/:id` | ✅ | Single comment |
| POST | `/comment` | ✅ | Create a comment (triggers email notification) |
| PATCH | `/comment/:id` | ✅ (owner) | Update comment |
| DELETE | `/comment/:id` | ✅ (owner) | Delete comment |

### Replies — `/reply`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/reply` | ✅ | All replies |
| GET | `/reply/:id` | ✅ | Single reply |
| POST | `/reply` | ✅ | Create a reply |
| DELETE | `/reply/:id` | ✅ (owner) | Delete a reply |

### Reactions — `/reaction`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/reaction` | ✅ | Toggle like/dislike on Post, Comment, or Reply |
| GET | `/reaction/:targetId` | ❌ | List all reactions for a target |
| GET | `/reaction/:targetId/count` | ❌ | Count likes & dislikes for a target |

---

## Data Models

### `users`

| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `username` | String | required, unique |
| `email` | String | required, unique |
| `password` | String | bcrypt hash, never returned |
| `skill` | String | required |
| `experience` | String | required |
| `createdAt`, `updatedAt` | Date | auto (timestamps) |

### `posts`

| Field | Type | Notes |
|---|---|---|
| `postTitle` | String | required |
| `postDescription` | String | required |
| `user` | ObjectId → User | required |
| `createdAt`, `updatedAt` | Date | auto |

### `comments`

| Field | Type | Notes |
|---|---|---|
| `commentTitle` | String | required |
| `commentDescription` | String | required |
| `user` | ObjectId → User | required |
| `post` | ObjectId → Post | required |
| `reply` | ObjectId[] → Reply | default `[]` |
| `createdAt`, `updatedAt` | Date | auto |

### `replies`

| Field | Type | Notes |
|---|---|---|
| `replyDescription` | String | required |
| `user` | ObjectId → User | required |
| `comment` | ObjectId → Comment | required |
| `reaction` | ObjectId[] → Reaction | default `[]` |
| `createdAt`, `updatedAt` | Date | auto |

### `reactions`

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | required |
| `type` | `'like'` \| `'dislike'` | required |
| `target` | ObjectId (polymorphic) | required |
| `onModel` | `'Post'` \| `'Comment'` \| `'Reply'` | required, drives `refPath` |
| `createdAt`, `updatedAt` | Date | auto |

### `refreshtokens`

| Field | Type | Notes |
|---|---|---|
| `token` | String | UUID v4 |
| `userId` | ObjectId | required |
| `expiryDate` | Date | +3 days from creation |

---

## Core Business Logic

### Authentication Flow

1. `POST /auth/signup` → validate → check email uniqueness → bcrypt hash → create user → send welcome email (via queue)
2. `POST /auth/login` → find by email → bcrypt compare → issue JWT (2h) + refresh token (3 days) stored in DB
3. `POST /auth/refresh` → find & delete refresh token from DB → issue new pair

### Post Gating (Cron + Guard)

Posts can only be created between **9:00 AM and 10:00 PM (Asia/Dhaka)**:

- A cron job at `0 9 * * *` calls `PostingWindowService.enable()`
- A cron job at `0 22 * * *` calls `PostingWindowService.disable()`
- `PostingWindowGuard` blocks creation when the service reports disabled

Additionally, a **rate limit of 5 posts per hour** per user is enforced via Redis INCR.

### Reaction Toggle Logic

`POST /reaction` is idempotent and toggles state:
- No existing reaction → **add** it
- Same type already exists → **remove** it (un-like)
- Different type exists → **switch** it (like ↔ dislike)

### Ranked Feed

`GET /post/ranked` runs a MongoDB aggregation that computes:
```
rankingScore = totalReactions + totalComments
```
Results are sorted descending and **cached in Redis for 30 seconds**.

### Email Notifications (BullMQ)

| Trigger | Job Name | Email Subject |
|---|---|---|
| User signup | `user-created-email` | `Welcome to Dev Community!` |
| Comment on post | `comment-notification-email` | `New comment notification` |
| 10 dislikes reached | `ten-dislikes-email` | `Your {type} received 10 dislikes` |

All jobs use **exponential backoff** with 3 retry attempts.

---

## External Integrations

### Gmail SMTP

Email is sent via Gmail using an [App Password](https://myaccount.google.com/apppasswords) (not your Google account password). Configure `EMAIL_USER` and `EMAIL_PASS` in `.env`.

### Redis

Used for three purposes simultaneously:
1. **BullMQ transport** — async mail job queue
2. **Rate limiting** — per-user, per-action INCR/EXPIRE counters
3. **Response caching** — ranked posts result (30s TTL)

All connect to the same local Redis instance.

### Swagger UI

Available at `http://localhost:3000/api` — all routes are documented with `@ApiOperation` and `@ApiProperty` decorators.

---

## Configuration & Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# JWT signing secret (use a long random string in production)
JWT_SECRET=your_secret_key_here

# MongoDB connection string
DB_URI=mongodb://localhost/dev_comm

# Gmail account for sending emails
EMAIL_USER=you@gmail.com
# Gmail App Password (Settings > Security > App Passwords)
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Application host and port
HOST=127.0.0.1
PORT=3000

# Redis port (currently informational — connections are hardcoded to 127.0.0.1:6379)
REDIS_PORT=6379
```

> **Note:** `.env` is gitignored and must be created manually. Never commit real credentials.

---

## Running Locally

### Prerequisites

| Requirement | Version / Notes |
|---|---|
| Node.js | ≥ 18 |
| MongoDB | Running on `localhost:27017` |
| Redis | Running on `localhost:6379` |
| Gmail App Password | Required for email features |

### Quick Start with Docker (Redis)

```bash
# Start Redis via Docker
docker run -d -p 6379:6379 redis
```

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file (see section above)

# 3. Start in development (watch mode — recommended)
npm run start:dev

# 4. Open Swagger UI
# http://localhost:3000/api
```

### Other Start Commands

```bash
# Standard start
npm run start

# Production (requires build first)
npm run build
npm run start:prod
```

---

## Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# End-to-end tests
npm run test:e2e

# Coverage report
npm run test:cov
```

---

## Known Issues & Risks

### 🐛 Bug: Comment Notification Emails Are Never Sent

`CommentService` enqueues a job named `'comment-notification'`, but `MailProcessor` only handles `'comment-notification-email'`. The job name mismatch means the processor throws `Unhandled job type` and no email is ever sent. Additionally, the payload shapes don't match — the enqueued job sends `{ postOwnerId, commenterId, commentId }` but the handler expects `{ email, message }`.

### 🐛 Bug: `throw new error(...)` Instead of `throw new Error(...)`

Several controllers import `error` from Node's `console` module and throw it as though it were an exception class. This produces unhandled errors instead of proper HTTP 4xx responses. Affects `PostController`, `UserController`, `CommentController`, and `ReplyController`.

```typescript
// ❌ Wrong — `error` is console.error, not an exception class
import { error } from 'console';
throw new error('Invalid User');

// ✅ Correct
throw new UnauthorizedException('Invalid User');
```

### ⚠️ Posting Window State Is In-Memory Only

`PostingWindowService` stores the enabled/disabled flag as a plain boolean. On server restart, posting defaults to **disabled** until the next 9 AM cron fires — even if the current time is within the window. The fix would be to persist the state in Redis (the module is already imported but unused for this purpose).

### ⚠️ Redis Host/Port Is Hardcoded

`127.0.0.1:6379` is hardcoded in three places (`app.module.ts`, `redis.module.ts`, `posting-window.module.ts`). The `REDIS_PORT` env var in `.env` has no effect on any of these connections.

### ⚠️ `sendTenDislikesEmail` Is Never Triggered

The method and its processor handler are fully implemented, but no service ever calls `sendTenDislikesEmail()`. The 10-dislikes feature is wired but not connected.

### ⚠️ Cache TTL Is `0` Globally (No Auto-Expiry)

`CacheModule` is configured with `ttl: 0`, meaning entries never expire unless explicitly set. Only the ranked-posts endpoint sets its own 30s TTL. Any future cached routes relying on the global default will cache indefinitely.

### 📌 No `.env.example` File

There is no example env file in the repository. Use the [Configuration](#configuration--environment-variables) section above as the reference.

---

## License

MIT
