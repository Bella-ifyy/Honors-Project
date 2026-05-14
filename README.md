# Workout

Monorepo for **Workout**, a fitness tracking product: a **NestJS** REST API (`workout-backend`) and an **Expo / React Native** client (`workout-mobile`) for iOS, Android, and web.

## Repository layout

| Package           | Description                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `workout-backend` | NestJS API, TypeORM + MySQL, JWT auth, integrations, notifications, workouts |
| `workout-mobile`  | Expo SDK 51 app (dev client), Redux, React Navigation                      |

Backend routes are served under the global prefix:

`workout/api/v1`

(Local dev defaults are described in the backend package; the mobile app reads `API_URL` from Expo config extras.)

## Prerequisites

- **Node.js** 20.x for local dev and CI (Firebase transitive deps require **≥20**; `dev.Dockerfile` may still reference 18 — align Docker when you rebuild images)
- **Yarn** classic (1.x) — both packages use `yarn.lock`
- **MySQL** — required to run the API against a real database (tests in CI use mocked modules and do not need MySQL)

Optional for mobile development:

- **Watchman** (macOS) — recommended by React Native / Expo for file watching
- **Xcode** (iOS), **Android Studio** (Android)
- **EAS CLI** — for cloud builds (`npm i -g eas-cli`)

## Quick start

### Backend

```bash
cd workout-backend
# Create .env with DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME and other secrets

yarn install
yarn db:migrate        # run TypeORM migrations
yarn start             # nodemon + ts-node (see package.json)
```

The HTTP server listens on the port configured in your environment (commonly **3014** in Docker).

Production bundle:

```bash
yarn build
yarn start:prod
```

### Mobile

```bash
cd workout-mobile
yarn install

# Configure API base URL via Expo extra (e.g. app.config.js / app.config.ts / env — match your setup)
yarn start             # expo start --dev-client
```

Platform targets:

```bash
yarn ios
yarn android
yarn web
```

## Environment variables (backend)

The API loads `.env` via `dotenv`. Database configuration is defined in `workout-backend/src/ormconfig.ts` and expects at minimum:

| Variable       | Purpose        |
| -------------- | -------------- |
| `DB_HOST`      | MySQL host     |
| `DB_PORT`      | MySQL port     |
| `DB_USERNAME`  | Database user  |
| `DB_PASSWORD`  | Database password |
| `DB_NAME`      | Database name  |

Additional variables may be required for auth providers, email, Firebase, etc., depending on which features you enable — inspect `process.env` usage in `workout-backend/src` when wiring a new environment.

## Scripts reference

### Backend (`workout-backend`)

| Script        | Description                                      |
| ------------- | ------------------------------------------------ |
| `yarn build`  | `nest build`                                     |
| `yarn start`  | Development server (nodemon)                     |
| `yarn test`   | Unit tests (Jest, `*.spec.ts` under `src`)       |
| `yarn test:e2e` | HTTP-level tests (`test/*.e2e-spec.ts`)      |
| `yarn test:cov` | Unit tests with coverage                      |
| `yarn lint`   | ESLint (with `--fix`; not run in CI yet)        |
| `yarn db:migrate` | Run migrations                             |
| `yarn db:seed` / `seed:*` | Template seed scripts              |

### Mobile (`workout-mobile`)

| Script       | Description                                      |
| ------------ | ------------------------------------------------ |
| `yarn start` | Expo dev server (dev client)                     |
| `yarn test`  | Jest via `jest-expo` (`jest.config.json`)        |
| `yarn lint`  | ESLint                                           |
| `yarn format`| Prettier                                         |
| `yarn ci`    | Aggressive clean install (watchman + reinstall)  |

## Testing

### Backend

- **Unit tests**: `cd workout-backend && yarn test` — colocated `*.spec.ts` files.
- **E2E-style tests**: `yarn test:e2e` — Jest config in `workout-backend/test/jest-e2e.json`. Current suites compile focused Nest testing modules (including mocks) and exercise routes with `supertest`; they **do not** require a running MySQL instance.

### Mobile

- **Unit/UI tests**: `cd workout-mobile && yarn test` — uses `jest-expo` with iOS, Android, and web project presets (`jest.config.json`). The repo may have few or no test files yet; `--passWithNoTests` is enabled so CI stays green while tests are added.

### Continuous integration

GitHub Actions runs on pushes and pull requests to `main` or `master` (see [.github/workflows/ci.yml](.github/workflows/ci.yml)):

- **Backend**: install → `yarn build` → `yarn test` → `yarn test:e2e`
- **Mobile**: install → `yarn test`

ESLint is **not** run in CI yet (backend has outstanding rule violations). Run `yarn lint` locally when touching a package.

Reproduce CI locally:

```bash
# Backend
cd workout-backend && yarn install --frozen-lockfile && yarn build && yarn test && yarn test:e2e

# Mobile
cd workout-mobile && yarn install --frozen-lockfile && yarn test
```

## Integration API (external apps)

Workout supports **API keys** for integrations (e.g. automation tools). Authenticated users create keys; clients send `X-API-Key`.

**Create a key**

```http
POST /workout/api/v1/api-keys
Authorization: Bearer <user jwt>

{
  "name": "Zapier",
  "scopes": ["notes:write", "tasks:write"]
}
```

The response includes the `token` once — store it securely.

**Authenticated requests**

```http
X-API-Key: <token>
```

**Notes**

```http
POST   /workout/api/v1/integrations/notes
PUT    /workout/api/v1/integrations/notes/:id
DELETE /workout/api/v1/integrations/notes/:id
```

**Tasks**

```http
POST   /workout/api/v1/integrations/tasks
PUT    /workout/api/v1/integrations/tasks/:id
DELETE /workout/api/v1/integrations/tasks/:id
```

(Full path prefix depends on deployment; adjust host and `/workout/api/v1` if your reverse proxy differs.)

## Deployment notes

- **Backend**: `workout-backend/vercel.json` suggests Vercel-style deployment; configure environment variables and database connectivity to match production MySQL.
- **Mobile**: `app.json` includes EAS-oriented metadata; use **EAS Build** / **Submit** for store releases (`eas-build*` scripts in `workout-mobile/package.json`).

CI in this repo validates **build and tests**; it does **not** deploy automatically unless you add a separate workflow with your hosting credentials.

## Contributing

1. Create a branch from `main` (or your default branch).
2. Run backend tests and mobile tests locally before opening a PR.
3. Follow existing formatting conventions; backend `yarn lint` may fail until historic lint debt is cleared — prefer small, focused changes.

## License

See individual packages (`private` fields and `LICENSE` if present). Backend `package.json` lists `UNLICENSED` — confirm distribution terms before reuse.
