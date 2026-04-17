# Go Funny Frontend

Mobile-first travel expense frontend scaffold built with React + Vite.

## Stack

- React 18
- Vite 5
- TypeScript
- Tailwind CSS
- React Router
- Lucide icons

## Theme Direction

- Japanese travel journal feel
- Natural palette with off-white, blue, and green
- Mobile-first layout and touch-friendly spacing

## Run

```bash
pnpm install
pnpm dev
```

## Other Commands

```bash
pnpm build
pnpm preview
```

## Future API Codegen

```bash
pnpm generate:api
```

This command generates the frontend client from the backend-owned OpenAPI endpoint configured in `orval.config.ts`.

## Included Screens

- Trip list
- Trip create
- Trip detail
- Member management
- Create expense
- Expense edit
- Create contribution
- Settlement

## Current Data Source

The UI currently uses local mock-backed app state from `src/lib/seed-data.ts` and `src/lib/app-data.tsx`.
Data persists in browser `localStorage`, so the MVP frontend flows can be exercised before the backend is ready.

## API Contract

The frontend currently uses the backend-owned OpenAPI spec at `https://go-funny-backend.onrender.com/openapi.json`.
This remote contract is the source of truth for code generation and API integration.

- `Trip.createdByUserId` is used by the frontend to determine owner-only destructive actions.
- Only the trip creator can see delete controls for removing members and deleting the trip.
