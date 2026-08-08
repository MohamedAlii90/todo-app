# QAcart Todo

A small todo application built as a system under test for QAcart automation
courses. Sign up, sign in, add todos, tick them off, delete them.

SvelteKit 2 + Svelte 5 + TypeScript, Tailwind for styling, Prisma over SQLite
for storage. Everything runs from one process — there is no separate backend to
start.

## Getting started

```bash
npm install
cp .env.example .env     # DATABASE_URL + JWT_SECRET
npm run setup            # prisma generate + db push + seed
npm run dev              # http://localhost:3001
```

Sign in with the seeded account:

| Email | Password |
|---|---|
| `user@qacart.com` | `Test@1234` |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build |
| `npm start` | Run the built app (`node build`) |
| `npm run check` | Type-check with `svelte-check` |
| `npm run setup` | Generate the Prisma client, create the database, seed it |
| `npm run seed` | Re-seed only |
| `npm run reset` | Delete the SQLite file and set it up again |

`npm run reset` recreates the database file, so restart `npm run dev` afterwards —
a running server keeps a handle on the old one.

## Pages

| Route | Auth | What it is |
|---|---|---|
| `/` | — | Redirects to `/todo`, or `/login` when signed out |
| `/login` | — | Sign in |
| `/signup` | — | Create an account |
| `/todo` | ✅ | Todo list — tick complete, delete, 5 per page |
| `/todo/new` | ✅ | Create a todo |

Signed-out visitors are redirected to `/login` on the server before the page
renders; signed-in visitors are bounced off `/login` and `/signup` to `/todo`.

## API

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/v1/users/register` | — | Body `{ firstName, lastName, email, password }` → 201 `{ access_token, userID, firstName }` |
| POST | `/api/v1/users/login` | — | Body `{ email, password }` → 200, same shape; 401 on bad credentials |
| POST | `/api/v1/users/logout` | — | Clears the session cookie |
| GET | `/api/v1/users/me` | ✅ | The signed-in user |
| GET | `/api/v1/tasks` | ✅ | `{ tasks: [...] }`, newest first |
| POST | `/api/v1/tasks` | ✅ | Body `{ item, isCompleted? }` → 201 with the created task |
| GET | `/api/v1/tasks/:id` | ✅ | The task, or 404 |
| PUT | `/api/v1/tasks/:id` | ✅ | Body `{ item?, isCompleted? }` → the updated task |
| DELETE | `/api/v1/tasks/:id` | ✅ | The deleted task |
| GET·DELETE | `/api/v1/clear` | ✅ | Deletes every task belonging to the caller — a reset hook for test setup |

Tasks are scoped to their owner. Anything belonging to another account answers
404, whether you read it, update it or delete it.

### Authenticating

The browser uses an httpOnly session cookie, set on register and login. API
clients can send the token instead:

```bash
TOKEN=$(curl -s -X POST localhost:3001/api/v1/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@qacart.com","password":"Test@1234"}' | jq -r .access_token)

curl localhost:3001/api/v1/tasks -H "Authorization: Bearer $TOKEN"
```

`Authorization: Bearer` takes precedence when both are present.

## Validation

| Field | Rule |
|---|---|
| First / last name | 2–30 characters |
| Email | Valid address, unique |
| Password | At least 8 characters |
| Todo item | 3–120 characters |

The forms and the API read the same rules from
`src/lib/server/validators/schemas.ts`.
