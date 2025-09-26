# GlowSkill Prospectus Dashboard

This project hosts a Next.js App Router workspace for the Glowskill prospectus and revenue dashboard. It ships with Tailwind CSS, shadcn/ui primitives, Recharts visualisations, and PDF export support so it can be connected directly to Xano.

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` and navigate to `/prospectus`.

> **Note:** the online package registry might require credentials. If installation fails, mirror the dependencies to a reachable registry before running the commands above.

## Environment variables

Set the base URL of your Xano workspace in `.env.local`:

```
NEXT_PUBLIC_XANO_BASE=https://your-xano-instance.com/api
```

## Data endpoints

The dashboard expects the following Xano endpoints:

- `GET /revenue/streams?scenario=conservative|realistic|optimistic` → returns 24 monthly revenue points with keys `month`, `estPro`, `infPro`, `cabina`, `saloniPro`.
- `GET /kpi/summary` (optional) → returns a JSON object with headline KPIs (`stylists`, `salons`, `proStylists`, `proInfluencers`, `bookingsMonth24`).

If the request fails or the environment variable is missing, the UI automatically falls back to demo data generated on the client.

## PDF export

The prospectus page includes an **Export PDF** button that captures the whole dashboard using `html2canvas` and creates an A4 PDF via `jspdf`.

## Project structure

```
src/
  app/
    layout.tsx
    page.tsx
    prospectus/
      page.tsx
  components/
    ScenarioSelect.tsx
    ProspectusCopy.tsx
    charts/
      RevenueByStream.tsx
      TotalRevenue.tsx
    ui/
      button.tsx
      card.tsx
      select.tsx
  lib/
    api.ts
  styles/
    globals.css
```

## Testing

The project includes standard Next.js scripts:

- `npm run lint`
- `npm run build`

Run them once dependencies are installed and the registry is reachable.
