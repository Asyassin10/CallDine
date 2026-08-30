# CallDine

CallDine is a Next.js 16 demo for restaurant voice ordering, customer self-service, and restaurant operations.

## Start locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

- Customer: `mara@ansel.co` / `demo123`
- Restaurant admin: `sofia@osteriavento.de` / `admin123`

The demo session is stored in a signed HTTP-only cookie. Change `AUTH_SECRET` in `.env.local` before sharing the app.

## Commands

- `npm run dev` — development server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript validation
- `npm run build` — production build

The original Design Canvas prototypes are preserved in `legacy/` and are not used by the Next.js application.
