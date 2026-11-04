# iHelp Admin Frontend

React (Vite) admin console for the iHelp backend. See `../ADMIN_PANEL_README.md`
at the project root for the full setup guide covering both backend and frontend.

## Quick start

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
npm run dev
```

Visit http://localhost:5173.

## Build for production

```bash
npm run build
```

Outputs static files to `dist/` — deploy behind any static host / reverse proxy,
pointed at your production API via `VITE_API_BASE_URL`.
