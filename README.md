This is a [Next.js](https://nextjs.org) app: reader-facing catalog at `/`, creator studio at `/studio`, and Postgres-backed stories/chapters.

Client-facing **pricing and five-year cost guide** (AI text + voice, plain-English scenarios, developer rates): [docs/CLIENT_PRICING_AND_TCO.md](docs/CLIENT_PRICING_AND_TCO.md).

## Database and sample books

1. Set `DATABASE_URL` in `.env` (see [.env.example](.env.example)).
2. Apply schema: `pnpm db:migrate` or `pnpm db:push`.
3. Load **demo public series** (demo author + 3 multi-chapter books): `pnpm db:seed`.

Re-running `pnpm db:seed` deletes the demo author (`00000000-0000-4000-8000-000000000001`) and re-inserts the sample catalog (safe for local dev). If you set `CATALOG_AUTHOR_USER_ID` in `.env`, use that same UUID—or unset it—so the home catalog lists the demo series.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
