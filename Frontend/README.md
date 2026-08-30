# CallDine

CallDine is a Next.js 16 interface for restaurant chat, delivery orders, reservations, knowledge management, and operations.

## Start locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local accounts

- Customer: `custmer@custmer.com` / `password`
- Restaurant admin: `admin@admin.com` / `password`

The session token is stored in an HTTP-only cookie. The FastAPI backend must be running on port `8000`.

## Commands

- `npm run dev` — development server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript validation
- `npm run build` — production build

The original Design Canvas prototypes are preserved in `legacy/` and are not used by the Next.js application.
