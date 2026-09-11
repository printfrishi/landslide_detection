# HimRakshak — Himalayan Landslide Monitoring & Early Warning System

A government-grade, citizen-focused landslide monitoring and early-warning portal for
Himalayan districts, built as a frontend demonstration. It presents live-style telemetry,
an interactive geospatial risk map, active alert feeds, and citizen services (risk
checker, incident reporting, alert subscriptions) — all running on clearly-labeled
sample data.

> **Demo platform** — not an official Government of India or Government of
> Uttarakhand website. All monitoring data, districts, alerts and incidents shown
> are simulated.

## Features

- **Government portal experience** — utility bar (accessibility, text-size, language),
  institutional header with national emblem corner and project logo, primary navigation
  with dropdowns, scrolling updates ticker, and a detailed department footer.
- **Live monitoring** — interactive Leaflet map with risk zones, monitoring stations,
  road corridors, rivers and active incidents (layer toggles, zoom, fullscreen).
- **Telemetry console** — SVG charts for rainfall, tilt, soil moisture, vibration,
  frequency and humidity with alert thresholds and 24-hour trends.
- **Alert system** — severity-graded alert feed (NORMAL → CRITICAL) with detail modal
  and acknowledgement flow.
- **Citizen services** — "Check landslide risk in your area", incident reporting form,
  and alert subscriptions.
- **Reference pages** — login/register with validation, operator dashboard, profile,
  settings, and 404 — all on a mock service layer that can be swapped for a real API
  without changing any component.

## Tech stack

- Vite + React 18 (JavaScript)
- Tailwind CSS v3.4 with shadcn/ui-style components (Radix primitives, CVA)
- react-router-dom v6 · lucide-react icons · Leaflet + OpenStreetMap/Esri tiles

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run preview  # preview the production build
```

Demo login: any valid email + a password of at least 6 characters (mock auth).

## Project layout

```
src/
├── components/        # ui primitives, feature components, layout, common
├── pages/             # Landing (gov portal), Monitoring, Alerts, Dashboard, ...
├── services/          # api wrapper + mock service layer (swap point for real API)
├── context/           # AuthContext, ToastContext
├── hooks/             # useAuth, useFetch, useDebounce
├── constants/         # routes, nav items, risk levels, sensor metadata
└── lib/               # cn() helper
```

## Disclaimer

Map tiles © OpenStreetMap contributors; satellite imagery © Esri. Photographs are
representative stock images, not actual monitored sites.
