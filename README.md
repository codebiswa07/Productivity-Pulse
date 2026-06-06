# ProductivityPulse — Full Stack Chrome Extension

**ProductivityPulse** is a full-stack productivity tracking platform that monitors browsing activity, analyzes focus patterns, blocks distracting websites, and provides real-time insights through a Chrome Extension, React dashboard, and Node.js backend.

---

**COMPANY**: *CODTECH IT SOLUTION*

**NAME**: *Biswaprakash Sahoo*

**INTERN ID**: *CTIS9533*

**DOMAIN**: *Mern Stack Web Development*

**DURATION**: *6 Weeks*

**MENTOR**: *Neela Santhosh Kumar*

---
#[Preview](https://productivity-pulse.vercel.app)

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/88615777-f4a5-4c68-9231-3c4e404180bd" />

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/4f97ac45-b762-428d-a703-77fca09a2822" />

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/bc30d1b0-752c-493c-a951-8bef14929322" />

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/18c4e307-cf14-47ee-a73d-72322f05620e" />

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/3de47d73-7ec5-47b5-a2f5-c53c4851de7a" />

---

## Architecture
```
productivity-pulse/
├── extension/              Chrome Extension (MV3)
│   ├── background/         Service Worker + modules
│   ├── content-scripts/    Content script
│   ├── popup/              Built popup (from extension-popup-src)
│   ├── options/            Extension options page
│   ├── blocked-page/       "Site blocked" page
│   ├── icons/              Extension icons
│   └── manifest.json
├── extension-popup-src/    Popup React/Vite source
├── server/                 Express + MongoDB API
└── client/                 React Dashboard (Vite + Tailwind)
```

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally OR a MongoDB Atlas URI

### 2. Install all dependencies
```bash
npm run install:all
```

### 3. Configure the server
```bash
cp server/.env.example server/.env
# Edit server/.env:
#   MONGODB_URI=mongodb://localhost:27017/productivity-pulse
#   JWT_SECRET=your_secret_here_min_32_chars
```

### 4. Start the backend
```bash
npm run dev:server
# → http://localhost:5000/api/health
```

### 5. Start the React dashboard
```bash
npm run dev:client
# → http://localhost:3000
```

### 6. Build the Chrome Extension popup
```bash
npm run build:popup
# Outputs to extension/popup/
```

### 7. Load the Chrome Extension
1. Open Chrome → `chrome://extensions/`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load Unpacked**
4. Select the `extension/` folder
5. The ProductivityPulse icon appears in your toolbar

### 8. Connect Extension to Backend
1. Register at `http://localhost:3000/register`
2. After login, go to **Settings** in the dashboard
3. Copy your JWT token (from browser DevTools → localStorage → `pp_token`)
4. Open the extension → Settings tab
5. Paste the JWT and set API URL to `http://localhost:5000/api`
6. Enable Cloud Sync

## API Endpoints

### Auth
- `POST /api/auth/register`  — `{ name, email, password }`
- `POST /api/auth/login`     — `{ email, password }`
- `GET  /api/auth/profile`   — (JWT required)

### Tracking
- `POST /api/tracking/batch`    — Bulk log from extension
- `POST /api/tracking/time-log` — Single log entry
- `GET  /api/tracking/today`    — Today's logs
- `GET  /api/tracking/history?days=7`

### Reports
- `GET /api/reports/daily?date=YYYY-MM-DD`
- `GET /api/reports/weekly`

### Settings
- `GET    /api/settings`
- `PUT    /api/settings`
- `GET    /api/settings/blocked-sites`
- `POST   /api/settings/blocked-sites`   — `{ domain }`
- `DELETE /api/settings/blocked-sites/:domain`

## How It Works

1. **Service Worker** tracks active tab → saves seconds per domain to `chrome.storage.local`
2. **Sync alarm** fires every 3 min → POSTs queued entries to `/api/tracking/batch`
3. **Blocking**: if you visit a blocked domain, the SW redirects to `blocked-page/blocked.html`
4. **Dashboard** at `localhost:3000` fetches reports from the API and visualises them
5. **Productivity Score** = (productive_time / total_time) × 100

## Production Deployment

### Backend (Railway / Render / VPS)
```bash
# Set environment variables:
MONGODB_URI=<Atlas URI>
JWT_SECRET=<strong secret>
NODE_ENV=production
FRONTEND_URL=https://your-dashboard.com
```

### Frontend (Vercel / Netlify)
```bash
cd client
VITE_API_URL=https://your-api.com/api npm run build
```

### Extension (Chrome Web Store)
- Update `apiBase` default in `extension/background/storage-manager.js`
- Run `npm run build:popup`
- Zip the `extension/` folder
- Submit via [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
#
