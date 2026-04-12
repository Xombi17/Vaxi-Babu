# Fix for Render Deployment Failure

## ❌ The Problem
Your deployment is failing because Alembic is trying to connect to the database **during the build phase**, but the database is only accessible **after deployment**.

Error: `OSError: [Errno 101] Network is unreachable`

## ✅ The Solution

### Step 1: Update Render Service Settings

Go to your Render Dashboard → Your Service → Settings:

1. **Build Command:** Change to:
   ```bash
   ./render-build.sh
   ```
   OR simply:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start Command:** Keep as:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

3. **Root Directory:** Must be `Backend`

### Step 2: Run Migrations Manually (First Time Only)

After your service deploys successfully:

1. Go to Render Dashboard → Your Service → Shell
2. Run:
   ```bash
   cd /opt/render/project/src/Backend
   alembic upgrade head
   ```

### Step 3: For Future Deployments

**Option A: Manual migrations (Recommended for production)**
- Run migrations via Render Shell after each deployment
- Gives you control over when migrations run

**Option B: Auto-migrations on startup**
- Your app already creates tables in development mode
- For production, you can add a pre-start script

## 🔍 Why This Happened

Your `requirements.txt` includes alembic, and something was triggering migrations during `pip install`. The build environment can't access external databases for security reasons.

## ✅ Quick Fix Checklist

- [ ] Change Build Command to: `pip install -r requirements.txt`
- [ ] Verify Root Directory is: `Backend`
- [ ] Verify Start Command is: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Set all required environment variables (DATABASE_URL, GOOGLE_AI_API_KEY, etc.)
- [ ] Redeploy
- [ ] Once deployed, run migrations via Shell: `alembic upgrade head`

## 📝 Required Environment Variables

Make sure these are set in Render Dashboard → Environment:

```
DATABASE_URL=postgresql+asyncpg://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
GOOGLE_AI_API_KEY=your_key
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
APP_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

## 🚀 After This Fix

Your service should:
1. Build successfully (just installs packages)
2. Start successfully (connects to database at runtime)
3. Pass health checks
4. Be ready for migrations via Shell
