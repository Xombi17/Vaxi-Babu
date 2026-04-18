# Vaxi Babu Vaxi - Deployment Guide

## 🚀 Quick Start

```bash
# Test locally
cd Frontend && npm run dev
cd Backend && uvicorn app.main:app --reload

# Access services
Frontend: http://localhost:3000
Backend: http://localhost:8000/health
API Docs: http://localhost:8000/docs
```

## 📋 Deployment Setup

### CI/CD Pipelines

- `.github/workflows/security.yml` - Security scanning
- `.github/workflows/backend.yml` - Backend tests & build
- `.github/workflows/frontend.yml` - Frontend build

### Application Hardening

- `Backend/app/core/health.py` - Health checks & validation
- Updated `Backend/app/main.py` - Startup validation

### Environment Templates

- `Backend/.env.example` - Backend configuration template
- `Frontend/.env.example` - Frontend configuration template

## 🔧 Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql+asyncpg://...
GITHUB_TOKEN=github_pat_...
GOOGLE_AI_API_KEY=...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
APP_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_GOOGLE_AI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 📦 Deployment Steps

### 1. Frontend Deployment (Vercel)

```bash
cd Frontend
npm run build  # Test build locally first
vercel --prod
```

**Vercel Environment Variables:**

- `NEXT_PUBLIC_API_URL` - Your backend URL (e.g., https://your-backend.onrender.com)
- `NEXT_PUBLIC_GOOGLE_AI_API_KEY` - Google AI API key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

### 2. Backend Deployment (Render)

**Option A: Via Render Dashboard**

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** Vaxi Babu-backend
   - **Root Directory:** `Backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free or Starter

**Option B: Via Render Blueprint (render.yaml)**
Create `render.yaml` in project root (see below)

**Backend Environment Variables (Set in Render Dashboard):**

- `DATABASE_URL` - Supabase connection string
- `GITHUB_TOKEN` - GitHub PAT
- `GOOGLE_AI_API_KEY` - Google AI key
- `SUPABASE_URL` - Supabase URL
- `SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `APP_ENV` - `production`
- `FRONTEND_URL` - Your Vercel URL

### 3. Database Migrations

Run migrations after backend deployment:

```bash
# SSH into Render or use Render Shell
cd Backend
alembic upgrade head
```

### 4. Verify Production

```bash
curl https://your-backend.onrender.com/health
# Should return: {"status":"healthy","environment":"production"}
```

## ✅ Verification Checklist

Before deployment:

- [ ] Frontend builds: `cd Frontend && npm run build`
- [ ] Backend syntax: `cd Backend && python -m py_compile app/main.py`
- [ ] Environment variables configured
- [ ] Database migrations ready

After deployment:

- [ ] Frontend loads at production URL
- [ ] Backend health endpoint responds: `curl https://your-backend.onrender.com/health`
- [ ] Voice functionality works (Gemini Live)
- [ ] Tool calls work (get_household_dependents, get_child_vaccination_status)
- [ ] Logs are being collected

## 🔐 Security

- ✅ All Vapi code removed
- ✅ Supabase configured
- ✅ Environment validation on startup
- ✅ Health checks implemented
- ✅ Security scanning enabled in CI/CD
- ✅ .env files in .gitignore

## 📞 Troubleshooting

### Frontend Build Issues

```bash
cd Frontend
rm -rf .next node_modules
npm install
npm run build
```

### Backend Issues

```bash
cd Backend
python -m py_compile app/main.py
python -c "from app.core.config import get_settings; print(get_settings())"
```

### Database Connection

```bash
psql postgresql://user:password@host:port/database
```

## 📚 Key Files

- `Backend/app/core/health.py` - Health checks
- `.github/workflows/` - CI/CD automation
- `Backend/requirements.txt` - Python dependencies
- `Frontend/package.json` - Node dependencies
- `DEPLOYMENT.md` - This file

## 🎯 Migration Status

- ✅ Vapi → Gemini Live (complete)
- ✅ Neon → Supabase (complete)
- ✅ All code cleaned up
- ✅ All configuration updated

## ⏱️ Time to Production

- Frontend deployment (Vercel): 10 minutes
- Backend deployment (Render): 10 minutes
- Database migrations: 2 minutes
- Production verification: 5 minutes
- **Total: ~30 minutes**

## 🚀 Common Render Deployment Issues

### Build Fails

- Check that `Root Directory` is set to `Backend`
- Verify `requirements.txt` is in Backend folder
- Check build logs for missing dependencies

### Start Command Fails

- Ensure start command is: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Verify all environment variables are set
- Check health endpoint validation isn't failing

### Database Connection Issues

- Verify `DATABASE_URL` uses `postgresql+asyncpg://` scheme
- Check Supabase connection pooler is enabled
- Ensure IP allowlist includes Render IPs (or set to allow all)

Questions? Check the troubleshooting section or review the GitHub Actions logs for CI/CD issues.
