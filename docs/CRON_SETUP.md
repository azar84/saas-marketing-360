# 🔄 Cron Job Setup Guide

This guide shows how to set up automated sitemap submission cron jobs on different deployment platforms.

## 📋 Overview

The sitemap cron job automatically submits your sitemap to search engines (Google, Bing) to improve SEO indexing.

## 🛠️ Universal Cron Script

We've created a universal cron script that works on any platform:

```bash
# Run manually
npm run cron:sitemap

# Or directly
node scripts/cron-sitemap.js
```

## 🌍 Platform-Specific Setup

### 1. **Heroku** (Recommended)

#### Option A: Heroku Scheduler (Free)
```bash
# Install Heroku CLI and login
heroku login

# Add scheduler addon
heroku addons:create scheduler:standard

# Open scheduler dashboard
heroku addons:open scheduler

# Or via CLI
heroku run "npm run cron:sitemap"
```

**In Heroku Scheduler Dashboard:**
- **Command**: `npm run cron:sitemap`
- **Frequency**: Daily (recommended)
- **Time**: 2:00 AM UTC (or your preferred time)

#### Option B: Heroku Cron (Paid)
```bash
# Add cron addon
heroku addons:create cron:daily

# Configure in app.json (already done)
```

### 2. **Vercel**

#### Option A: Vercel Cron Jobs (Pro Plan)
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/submit-sitemap",
      "schedule": "0 2 * * *"
    }
  ]
}
```

#### Option B: External Cron Service
Use services like:
- **Cron-job.org** (Free)
- **EasyCron** (Free tier available)
- **SetCronJob** (Free tier available)

**URL to call**: `https://your-app.vercel.app/api/cron/submit-sitemap`
**Headers**: `Authorization: Bearer YOUR_CRON_SECRET`

### 3. **Railway**

#### Option A: Railway Cron Jobs
```bash
# Add to package.json scripts
"cron": "node scripts/cron-sitemap.js"

# Use Railway's built-in cron
railway cron add "0 2 * * *" "npm run cron"
```

#### Option B: External Service
Same as Vercel - use external cron services.

### 4. **Render**

#### Option A: Render Cron Jobs
```yaml
# render.yaml
services:
  - type: web
    name: your-app
    # ... other config

  - type: cron
    name: sitemap-cron
    env: node
    plan: free
    schedule: "0 2 * * *"
    buildCommand: npm install
    startCommand: npm run cron:sitemap
```

#### Option B: External Service
Same as above.

### 5. **Netlify**

#### External Cron Service Only
Netlify doesn't support cron jobs natively. Use external services:

**URL**: `https://your-app.netlify.app/api/cron/submit-sitemap`

### 6. **DigitalOcean App Platform**

#### Option A: App Platform Cron Jobs
```yaml
# .do/app.yaml
name: your-app
services:
  - name: web
    # ... web service config

  - name: cron
    source_dir: /
    github:
      repo: your-repo
      branch: main
    run_command: npm run cron:sitemap
    schedule: "0 2 * * *"
```

### 7. **AWS/GCP/Azure**

#### Option A: Cloud Functions + Cloud Scheduler
```bash
# Deploy as cloud function
gcloud functions deploy sitemap-cron \
  --runtime nodejs18 \
  --trigger-http \
  --entry-point cronSitemap \
  --source . \
  --allow-unauthenticated
```

#### Option B: EC2/Compute Engine + crontab
```bash
# SSH into your server
crontab -e

# Add this line
0 2 * * * cd /path/to/your/app && npm run cron:sitemap
```

## 🔧 Environment Variables

Set these in your deployment platform:

```bash
# Required
CRON_SECRET=your-secret-token-here

# Recommended (for URL detection)
NEXT_PUBLIC_BASE_URL=https://your-app.com

# Platform-specific (auto-detected)
HEROKU_APP_NAME=your-app-name
VERCEL_URL=your-app.vercel.app
RAILWAY_STATIC_URL=https://your-app.railway.app
RENDER_EXTERNAL_URL=https://your-app.onrender.com
```

## 🧪 Testing

### Test Locally
```bash
# Set environment variables
export CRON_SECRET=your-secret
export NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Run the script
npm run cron:sitemap
```

### Test on Production
```bash
# Test the endpoint directly
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-app.com/api/cron/submit-sitemap
```

## 📊 Monitoring

### Check Logs
```bash
# Heroku
heroku logs --tail

# Vercel
vercel logs

# Railway
railway logs

# Render
render logs
```

### Health Check Endpoint
The cron endpoint returns detailed information:
```json
{
  "success": true,
  "message": "Scheduled sitemap submission completed",
  "data": {
    "google": { "success": true, "message": "..." },
    "bing": { "success": true, "message": "..." },
    "summary": {
      "totalSubmitted": 2,
      "successful": 2,
      "failed": 0
    }
  },
  "timestamp": "2024-01-01T02:00:00.000Z"
}
```

## 🚨 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check `CRON_SECRET` environment variable
   - Verify the secret matches in your app

2. **404 Not Found**
   - Ensure the cron endpoint is deployed
   - Check the URL path: `/api/cron/submit-sitemap`

3. **Timeout Errors**
   - Increase timeout in external cron services
   - Check if your app is responsive

4. **URL Detection Issues**
   - Set `NEXT_PUBLIC_BASE_URL` explicitly
   - Check platform-specific environment variables

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run cron:sitemap
```

## 🔒 Security

- **Never expose** your `CRON_SECRET` in client-side code
- **Use HTTPS** for all production endpoints
- **Rotate secrets** periodically
- **Monitor logs** for unauthorized access attempts

## 📅 Recommended Schedule

- **Frequency**: Daily
- **Time**: 2:00 AM UTC (or your local timezone)
- **Reason**: Search engines are most active during off-peak hours

## 🎯 Success Metrics

Monitor these to ensure your cron job is working:

1. **HTTP Status**: 200 OK
2. **Response Time**: < 30 seconds
3. **Success Rate**: > 95%
4. **Search Engine Indexing**: Improved over time

---

## 📞 Support

If you encounter issues:

1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Test the endpoint manually
4. Check platform-specific documentation

The universal script should work on any platform that supports Node.js! 🚀 