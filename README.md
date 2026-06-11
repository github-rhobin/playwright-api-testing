# Playwright API Testing

A hands-on API automation tutorial using [Playwright Test](https://playwright.dev) against the [RESTful-Booker](https://restful-booker.herokuapp.com) API.

## What's Covered

- **CRUD Operations** — POST, GET, PUT, PATCH, DELETE for booking endpoints
- **Authentication** — Token-based auth via the `/auth` endpoint
- **Data Strategies** — Static JSON fixtures, dynamic payloads with [Faker](https://fakerjs.dev), and type-safe schemas with [Zod](https://zod.dev)
- **API Object Model** — Encapsulates each API domain into a dedicated folder with three files:
  - `client` — handles HTTP communication via Playwright's `APIRequestContext`
  - `schema` — defines TypeScript types and runtime validation with Zod
  - `factory` — generates test payloads with Faker for randomized data
- **Playwright Fixtures** — Custom fixtures for automatic auth token injection
- **Response Utilities** — Centralized response formatting, logging, and error reporting
- **Schema Validation** — Runtime response validation with Zod
- **API Mocking** — Request interception, response modification, and HAR file recording/replay

### Key Libraries

| Tool | Role in API Testing |
|---|---|
| **[Faker](https://fakerjs.dev)** | Generates realistic, randomized payloads so tests aren't brittle (no hardcoded values). Each test run gets fresh data — great for catching server-side state issues. |
| **[Zod](https://zod.dev)** | Validates API responses at runtime with declarative schemas. Catches contract breaks early (missing fields, wrong types) and gives clear error messages, all without leaving TypeScript. |

## Project Structure

```
├── src/
│   ├── api/
│   │   ├── auth/          — auth-client.ts, auth-schema.ts
│   │   └── booking/       — booking-client.ts, booking-factory.ts, booking-schema.ts
│   ├── fixtures/          — Playwright custom fixtures
│   └── utils/             — Response utility helpers
├── test-data/             — Static JSON test data
├── tests/                 — All test specs (*.spec.ts, *.api.spec.ts)
├── hars/                  — Recorded HAR files for mocking
└── playwright.config.ts   — Playwright configuration
```

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install                          # Install Node dependencies
npx playwright install chromium      # Download Chromium (needed for mocking tests)
```

> **Note:** On Linux, if you need headed browser mode (e.g., local testing with `--headed`), append `--with-deps` to install required system libraries. CI and Windows users don't need it.

## Running Tests

```bash
npx playwright test                        # Run all tests
npx playwright test --project=api-tests    # Run API tests only
npx playwright test --grep "Mocking"       # Run a specific group
```

## CI/CD

- **GitHub Actions** — `.github/workflows/test-workflow.yml` triggers on push/PR, installs dependencies, runs tests, publishes JUnit results, and uploads the Playwright report as an artifact.
- **Jenkins (freestyle, Windows)** — Build step runs the following, with secrets managed via Jenkins credentials:
  ```bat
  :: 1. Delete any old local file to guarantee we use the fresh Jenkins secret
  if exist .env del .env

  :: 2. Copy the secret file to a local .env file in the workspace
  copy "%SECRETS_ENV%" .env

  :: 3. Install project dependencies quickly (skips audits and funding logs)
  call npm ci --no-audit --no-fund

  :: 4. Install ONLY Chromium to save data size and disk space
  call npx playwright install chromium

  :: 5. Run the Playwright automation tests
  call npx playwright test

  :: 6. Clean up the credentials so they aren't left exposed on the hard drive
  if exist .env del .env
  ```
  Post-build actions: Publish HTML Report, Publish Allure Report, Publish JUnit Test Results.<br></br>Secrets stored in Jenkins: `SECRETS_ENV` (`.env` with credentials) and GitHub PAT.

## Configuration

Environment variables (optional) can be set in a `.env` file:

```
AUTH_USERNAME=admin
AUTH_PASSWORD=password123
```

Defaults: `admin` / `password123` (matching RESTful-Booker defaults). 

