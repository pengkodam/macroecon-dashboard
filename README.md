# 🇲🇾 Malaysia Macro Forecast

An open-source, crowdsourced macroeconomic forecast dashboard for Malaysia. All data is fetched client-side from free, open APIs — no server, no API keys, no cost.

## Data Sources (all free & open)

| Source | Indicators | License |
|--------|-----------|---------|
| **[OpenDOSM](https://open.dosm.gov.my)** | CPI Inflation, Industrial Production Index, Labour Force (Unemployment), Leading Economic Index | CC BY 4.0 |
| **[data.gov.my API](https://developer.data.gov.my)** | Malaysian government open data portal | Open |
| **[World Bank](https://data.worldbank.org)** | GDP Growth, Exchange Rate, Population | CC BY 4.0 |
| **[IMF WEO](https://www.imf.org/external/datamapper)** | GDP Growth Forecast, Current Account, Government Debt (with multi-year forecasts) | Open |

## Features

- **Live data**: All indicators fetched in real-time from official APIs
- **Forecasts**: IMF World Economic Outlook projections shown alongside actuals
- **Crowdsource**: Submit your own forecasts and compare with official estimates
- **Model forecasts**: Simple exponential smoothing for indicators without official forecasts
- **Zero infrastructure**: Runs entirely client-side, deploys as static on Vercel
- **Mobile-first**: Fully responsive dark-mode dashboard

## Indicators Tracked

1. 📈 **GDP Growth Rate** — Real GDP growth YoY (IMF + World Bank)
2. 🏷️ **CPI Inflation** — Consumer Price Index (OpenDOSM + World Bank)
3. 👷 **Unemployment Rate** — Labour force survey (OpenDOSM + World Bank)
4. 🌐 **Current Account Balance** — % of GDP (IMF WEO)
5. 🏦 **Government Debt** — % of GDP (IMF WEO)
6. 🏭 **Industrial Production Index** — Manufacturing output (OpenDOSM)
7. 🔮 **Leading Economic Index** — Composite leading indicator (OpenDOSM)
8. 💱 **Exchange Rate** — MYR/USD (World Bank)
9. 👥 **Population** — Total population (World Bank)

## Getting Started

### Prerequisites

- Node.js 18+
- [uv](https://docs.astral.sh/uv/) (optional, for Python tooling)

### Install & Run

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

### Deploy to Vercel

```bash
# Option 1: Vercel CLI
npx vercel

# Option 2: Connect GitHub repo to Vercel dashboard
# Push to GitHub, import in vercel.com/new
```

No environment variables needed. No API keys. Just deploy.

## Architecture

```
Client Browser
  ├── OpenDOSM API (api.data.gov.my)
  ├── World Bank API (api.worldbank.org)
  └── IMF DataMapper API (imf.org)
        ↓
  React Dashboard (Next.js)
  ├── StatCard grid (overview)
  ├── IndicatorChart (Recharts)
  ├── ForecastForm (crowd input)
  └── localStorage (user forecasts)
```

**Key design decisions:**
- All data fetching happens client-side (no server-side API calls) to keep hosting free
- User forecasts stored in `localStorage` (no backend needed for MVP)
- Fallback chain: OpenDOSM → World Bank → IMF for each indicator
- Simple exponential smoothing generates forecasts where IMF projections aren't available

## Future Roadmap

- [ ] Backend API for aggregating community forecasts
- [ ] BNM (Bank Negara Malaysia) interest rate data
- [ ] External trade detailed breakdown
- [ ] Prediction market-style scoring of forecast accuracy
- [ ] ASEAN comparison mode
- [ ] Email/webhook alerts on new data releases

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS
- **Charts**: Recharts
- **Fonts**: DM Serif Display + IBM Plex Sans/Mono
- **Deploy**: Vercel (zero-config)

## License

MIT — Use freely, contribute back.

---

Built for Malaysia 🇲🇾 · Data is power when it's open.
