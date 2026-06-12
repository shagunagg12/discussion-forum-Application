# Anchors — MERN Discussion Forum

A full-stack threaded discussion forum with JWT authentication, nested comments, and a configurable credit reward system.

**Stack:** MongoDB · Express · React · Node.js · TypeScript · Tailwind CSS

---

## Features

- **JWT Authentication** — register, login, persistent sessions
- **Posts** — create, browse public feed (newest first)
- **Threaded Comments** — unlimited nesting depth with collapse/expand
- **Credit System** — OP earns credits per comment based on depth (DB-configurable arithmetic progression)
- **Soft Delete** — comments are soft-deleted (`isDeleted`); credits are automatically reversed
- **Dashboard** — credit total, transaction history, credit config editor

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| MongoDB | Running locally on port 27017 |

---

## Quick Start

### 1. Clone & open

```bash
cd Anchors
```

### 2. Backend setup

```bash
cd server
npm install
```

Edit `.env` if needed (defaults work for local MongoDB):

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/anchors_forum
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd ../client
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Project Structure

```
Anchors/
├── server/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route handlers (auth, posts, comments, credits)
│   │   ├── middleware/      # JWT auth, validation, error handler
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # creditService (award/reverse)
│   │   └── index.ts         # Entry point
│   ├── .env
│   └── package.json
│
└── client/
    ├── src/
    │   ├── api/             # Typed Axios API layer
    │   ├── components/      # Navbar, PostCard, CommentNode, CommentForm, ProtectedRoute
    │   ├── context/         # AuthContext
    │   ├── pages/           # Feed, Login, Register, NewPost, PostDetail, Dashboard
    │   └── types/           # Shared TypeScript interfaces
    └── package.json
```

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register → returns JWT |
| POST | `/api/auth/login` | — | Login → returns JWT |
| GET | `/api/auth/me` | ✓ | Current user |

### Posts
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/posts` | — | All posts (newest first) |
| GET | `/api/posts/:id` | — | Single post |
| POST | `/api/posts` | ✓ | Create post |

### Comments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/posts/:postId/comments` | — | Full comment tree |
| POST | `/api/posts/:postId/comments` | ✓ | Add comment/reply (`parentId` optional) |
| DELETE | `/api/comments/:id` | ✓ | Soft-delete own comment |

### Credits
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/credits/config` | ✓ | Get credit config |
| PUT | `/api/credits/config` | ✓ | Update credit config |
| GET | `/api/credits/users/:id` | ✓ | User credit total + history |

---

## Credit System

Credit earned by the OP when someone comments on their post follows an arithmetic progression stored in the `CreditConfig` collection:

```
credit(depth) = startValue + (depth - 1) × increment
```

**Default config:** `startValue = 1`, `increment = 2`

| Depth | Credits |
|-------|---------|
| 1 | 1 |
| 2 | 3 |
| 3 | 5 |
| 4 | 7 |
| … | … |

- Config can be changed live from the Dashboard → takes effect for all new comments
- When a comment is **soft-deleted**, the `CreditTransaction` for that comment is marked `isReversed = true` and the OP's credit total is decremented accordingly

---

## MongoDB Schemas

| Collection | Key Fields |
|-----------|-----------|
| `users` | `username`, `email`, `passwordHash`, `credits` |
| `posts` | `title`, `body`, `author` (ref User) |
| `comments` | `postId`, `parentId`, `depth`, `author`, `body`, `isDeleted` |
| `creditconfigs` | `startValue`, `increment` (single document) |
| `credittransactions` | `commentId`, `opId`, `amount`, `depth`, `isReversed` |

---

## Build for Production

```bash
# Backend
cd server && npm run build && node dist/index.js

# Frontend
cd client && npm run build
# Serve dist/ with any static host or nginx
```
