# MAMS Frontend: military-asset-management-frontend

React + Vite single-page application.

## Local Run

```powershell
npm install
npm run dev
```

The local Vite server proxies `/api` to `http://localhost:8081`.

## Vercel Deployment

Import this repository into Vercel. Use the repository root as the project root, `npm run build` as the build command, and `dist` as the output directory. Set this environment variable for Production and Preview builds:

- `VITE_API_URL`: the Render backend origin, for example `https://your-backend.onrender.com`

After deploying, add the exact Vercel origin to the backend's `CORS_ALLOWED_ORIGINS` environment variable on Render.
