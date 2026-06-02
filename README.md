# CACCO Command Platform

**Centro de Alta Contención del Crimen Organizado** — a React single-page application for prison facility management and operations.

This is a frontend-only prototype. All data is generated in-browser from a static seed — there is no backend server.

---

## Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Framework  | React 18 (Create React App)               |
| Routing    | React Router v6                           |
| Charts     | Chart.js 4 + react-chartjs-2             |
| Maps       | React-Leaflet + Leaflet                   |
| Styling    | Tailwind CSS 3 + CSS custom properties    |
| Data       | Static mock data (no server required)     |
| i18n       | Custom LanguageContext (EN / ES)          |

---

## Pages

| Route             | Page                    | Description                                      |
|-------------------|-------------------------|--------------------------------------------------|
| `/`               | Command Center          | KPI overview, live alerts, AI advisories         |
| `/security`       | Security Operations     | Guard assignments, perimeter status              |
| `/surveillance`   | Surveillance Center     | Camera feeds, zone monitoring                    |
| `/incidents`      | Incident Management     | Incident log, escalation workflows               |
| `/intelligence`   | Inmate Intelligence     | Inmate profiles, risk assessments                |
| `/analytics`      | AI Analytics            | Predictive models, trend analysis                |
| `/staff`          | Staff Operations        | Shift management, HR overview                    |
| `/rehabilitation` | Rehabilitation Programs | Program tracking, inmate progress                |
| `/twin`           | Digital Twin            | Interactive facility map                         |
| `/reports`        | Reports                 | Exportable compliance and operational reports    |
| `/admin`          | System Admin            | Configuration, user management (UI only)         |

---

## Quick Start

```bash
# Install dependencies
cd client && npm install

# Start development server → http://localhost:3000
npm start
```

From the project root:

```bash
npm run dev      # starts client dev server
npm run build    # builds to client/build/
```

---

## Deploy with Docker

```bash
# Build image (inject real API URLs if connecting a backend)
docker build \
  --build-arg REACT_APP_API_URL=https://api.your-domain.com \
  --build-arg REACT_APP_SOCKET_URL=https://api.your-domain.com \
  -t cacco-platform .

# Run
docker run -p 8080:80 cacco-platform
# → open http://localhost:8080
```

The image uses nginx with proper SPA routing, security headers, gzip compression, and long-lived cache headers for hashed static assets.

---

## Deploy as Static Site (Netlify / Vercel / S3)

```bash
cd client && npm run build
# Publish client/build/ to any static host
```

All routes must rewrite to `index.html`. A `netlify.toml` redirect rule example:

```toml
[[redirects]]
  from = "/*"
  to   = "/index.html"
  status = 200
```

---

## Environment Variables

Copy `client/.env.production.example` to `client/.env.production.local` and fill in values before building.

| Variable                    | Required | Description                                 |
|-----------------------------|----------|---------------------------------------------|
| `REACT_APP_API_URL`         | No       | REST API base URL (future backend)          |
| `REACT_APP_SOCKET_URL`      | No       | Socket.io server URL (future backend)       |
| `REACT_APP_REALTIME_MODE`   | No       | `polling` or `socket` (default: `polling`)  |

All three are optional while the app uses mock data.

---

## Project Structure

```
costaricaPrison/
├── Dockerfile                    # Multi-stage build → nginx serve
├── nginx.conf                    # SPA routing + security headers
├── .github/workflows/ci.yml      # GitHub Actions: lint + build on push
├── package.json                  # Root: dev / build scripts
└── client/
    ├── .env.example
    ├── .env.production.example
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.jsx               # Routes, lazy loading, ErrorBoundary
        ├── index.js              # Entry point, web-vitals reporting
        ├── index.css             # Design tokens, Tailwind base
        ├── components/
        │   ├── ErrorBoundary.jsx # Catches runtime errors gracefully
        │   ├── Layout.jsx        # Sidebar, header, alert/advisory panels
        │   ├── AlertPanel.js     # Real-time alerts slide-out
        │   ├── AdvisoryPanel.js  # AI advisories slide-out
        │   ├── KPICard.js        # KPI metric card
        │   └── ...
        ├── pages/                # 11 lazy-loaded page components
        ├── services/
        │   ├── CaccoData.jsx     # React Context: mock data provider
        │   ├── api.js            # API stubs (mock responses)
        │   └── socket.js        # Socket.io stub
        ├── contexts/
        │   └── LanguageContext.jsx  # EN / ES i18n context
        ├── config/
        │   └── nav.js            # Navigation structure
        ├── data/
        │   └── mockData.js       # Seed data generator
        └── utils/
            ├── format.js
            ├── tone.js
            └── useNow.js
```

---

## CI/CD

GitHub Actions runs on every push to `master` / `main`:

1. Install dependencies (`npm ci`)
2. Lint (`npm run lint`)
3. Build (`npm run build`)
4. Upload `client/build/` as a build artifact (retained 7 days)

Configure `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` as GitHub repository secrets to inject real values at build time.

---

## Customisation

**Retheming** — all colours are CSS custom properties in `client/src/index.css`. Change `--app-panel`, `--app-accent`, and `--app-advisory` to retheme every component at once.

**KPI values** — edit `SEED_KPIS` in `client/src/services/CaccoData.jsx`.

**Navigation labels** — update `NAV_SECTIONS` in `client/src/config/nav.js`.

**Static advisories** — edit `STATIC_ADVISORIES` in `client/src/components/AdvisoryPanel.js`.

**Alerts** — edit the alert seed in `client/src/services/CaccoData.jsx`.
