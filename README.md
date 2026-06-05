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
npm install
```

## Running Tests

```bash
npx playwright test              # Run all tests
npx playwright test --headed     # Run with browser UI (for mocking tests)
npx playwright test --ui         # Playwright UI mode
```

## Configuration

Environment variables (optional) can be set in a `.env` file:

```
AUTH_USERNAME=admin
AUTH_PASSWORD=password123
```

Defaults: `admin` / `password123` (matching RESTful-Booker defaults). 

