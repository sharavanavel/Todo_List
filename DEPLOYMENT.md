# MongoDB Atlas + Deployment Guide

Architecture:

```
Browser (React, Vite)  →  Express API (server/)  →  MongoDB Atlas
```

---

## Part 1 — Create your free MongoDB Atlas database

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free).
2. **Create a cluster:** choose the free **M0** tier, pick a provider/region close to you
   (for Chennai, an AWS Mumbai region is a good choice), then click **Create**.
3. **Create a database user** (Security → *Database Access* → *Add New Database User*):
   - Authentication: *Password*
   - Username, e.g. `taskuser`, and a strong password
   - Built-in role: *Read and write to any database*
   - Tip: avoid special characters in the password. If you use any (`@ : / ? # %`),
     they must be URL-encoded in the connection string (`@` becomes `%40`).
4. **Allow network access** (Security → *Network Access* → *Add IP Address*):
   - For local development: click *Add Current IP Address*.
   - For a deployed app (Render etc.): the host's IP changes, so use
     **Allow access from anywhere** (`0.0.0.0/0`). This is safe only if your
     database password is strong.
5. **Get the connection string:** *Database* → your cluster → **Connect** → **Drivers** → copy it. It looks like:
   ```
   mongodb+srv://taskuser:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
6. Put your password in place of `<password>` and add the database name `taskmanager`
   right before the `?`:
   ```
   mongodb+srv://taskuser:MyPass123@cluster0.abcde.mongodb.net/taskmanager?retryWrites=true&w=majority
   ```
   The `tasks` collection is created automatically when you add the first task.

---

## Part 2 — Run everything locally

```bash
# 1. Install frontend + backend dependencies
npm run install:all

# 2. Configure the backend
cp server/.env.example server/.env      # Windows: copy server\.env.example server\.env
# open server/.env and paste your MONGO_URI

# 3. Start the backend (Terminal 1)
npm run server
#   → ✅ Connected to MongoDB
#   → 🚀 API running on port 5000

# 4. Start the frontend (Terminal 2)
npm run dev
```

Open http://localhost:5173. Add a task, refresh the page, and it should still be there.
You can also see it in Atlas under *Database → Browse Collections → taskmanager → tasks*.

Quick health check: http://localhost:5000/api/health → `{"status":"ok","db":"connected"}`

---

## Part 3 — Deployment options

### Option A (recommended, easiest): ONE service on Render

The Express server also serves the built React app, so you deploy a single service and
never deal with CORS.

1. Push this project to a GitHub repository (`.env` files are already git-ignored).
2. On https://render.com → **New → Web Service** → connect your repo.
3. Settings:
   | Field | Value |
   |---|---|
   | Runtime | Node |
   | Build Command | `npm run render-build` |
   | Start Command | `npm start` |
   | Instance type | Free |
4. Under **Environment**, add the variable:
   - `MONGO_URI` = your Atlas connection string (from Part 1)
5. Click **Create Web Service**. After the build finishes you get a URL like
   `https://personal-task-manager.onrender.com`. Open it. That's your app.
6. Make sure Atlas *Network Access* allows `0.0.0.0/0` (Part 1, step 4).

Note: on Render's free plan the service goes to sleep after a period of inactivity, so the
first request after a while can take up to about a minute. A paid instance avoids that.

### Option B: Split hosting (frontend on Vercel/Netlify, API on Render)

1. Deploy the **API** on Render as above, but use:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment variables: `MONGO_URI` and
     `CLIENT_ORIGIN` = your frontend URL (e.g. `https://my-tasks.vercel.app`, no trailing slash)
2. Deploy the **frontend** on Vercel or Netlify (root of the repo):
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment variable: `VITE_API_URL` = your Render API URL
     (e.g. `https://task-api.onrender.com`, no trailing slash)
3. Redeploy the frontend after setting `VITE_API_URL` (Vite reads it at build time).

### Option C: Your own VPS (Ubuntu) with PM2

```bash
git clone <your-repo> && cd personal-task-manager
npm run install:all
npm run build                     # creates dist/
echo 'MONGO_URI=...' > server/.env
sudo npm i -g pm2
pm2 start server/index.js --name task-manager
pm2 save && pm2 startup
```
Put Nginx (or Caddy) in front as a reverse proxy to `localhost:5000` and add HTTPS
with Let's Encrypt.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `MongoServerSelectionError` / timeout | Your IP isn't allowed in Atlas *Network Access* |
| `bad auth : Authentication failed` | Wrong username/password, or special characters not URL-encoded |
| Page says "Could not load tasks" | The backend isn't running, or (split hosting) `VITE_API_URL` / `CLIENT_ORIGIN` is wrong |
| CORS error in the browser console | `CLIENT_ORIGIN` must exactly match the frontend URL (no trailing `/`) |
| Works locally, blank page on Render | Build Command must be `npm run render-build` (it builds `dist/`) |

## Important notes

- **No login yet:** anyone who knows your app's URL can read and edit the tasks. Fine for
  personal use with a URL you don't share; add authentication before sharing it publicly.
- **Secrets:** keep `MONGO_URI` only in `server/.env` or the host's environment settings, never in
  the React code or in git.
- **Reminders:** the 30-second reminder checker still runs in the browser, so email
  reminders fire only while the app is open in a tab.
