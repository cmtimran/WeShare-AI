# Deployment Guide for WeShare-AI

Your project is now **Vercel Ready**! 

I have created the necessary API functions in the `api/` folder to replace your local test server with real cloud storage using **Vercel Blob** (for files) and **Vercel KV** (for database/metadata).

## 🚀 How to Deploy

### Step 1: Install Vercel CLI (Optional)
If you haven't already, you can verify your deployment locally:
```bash
npm install -g vercel
```

### Step 2: Push to GitHub
Make sure all your latest changes are committed and pushed to your GitHub repository. Vercel deploys automatically from GitHub.

### Step 3: Import Project in Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Import your `WeShare-AI` repository.
4. Framework Preset: **Vite**.
5. Root Directory: `./` (default).

### Step 4: Add Storage Integrations (CRITICAL)
Your app needs two storage databases to function:

1. **Vercel Blob** (for storing PDF/Image files):
   - In your valid Vercel Project, go to the **Storage** tab.
   - Click **Create Database**.
   - Select **Blob**.
   - Follow steps to create it and **Connect** it to your `WeShare-AI` project.
   - *This automatically adds `BLOB_READ_WRITE_TOKEN` to your Environment Variables.*

2. **Vercel KV** (Redis - for storing transfer links/passwords):
   - In the **Storage** tab again.
   - Click **Create Database**.
   - Select **KV** (Redis).
   - Create and **Connect** it to your `WeShare-AI` project.
   - *This automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`.*

### Step 5: Environment Variables
Go to **Settings** -> **Environment Variables** and ensure you have:
- `GEMINI_API_KEY`: (Your Google Gemini AI Key)
- *(The Storage keys are added automatically in Step 4)*

### Step 6: Deploy
Once Storage is connected, Vercel might auto-redeploy, or you can manually redeploy from the dashboard (Deployments -> three dots -> Redeploy) to ensure the environment variables are picked up.

---

## 🛑 Local Development Changes
To run this **Locally** with the *Real* Vercel APIs (instead of the `server/index.js` mock):

1. **Pull Env Vars**:
   ```bash
   vercel env pull .env.local
   ```
2. **Run Vercel Dev**:
   ```bash
   vercel dev
   ```
   *This emulates the Vercel environment locally.*

If you want to keep using the **Offline Mock Server** (`node server/index.js`), you can still do that! The existing `npm run dev` setup relies on the mock server. The new `api/` folder files are only used by Vercel (or `vercel dev`).
