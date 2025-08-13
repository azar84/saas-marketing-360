# 🔧 Enrichment System Troubleshooting Guide

## 🚨 **Current Issue: HTTP 500 Error**

The enrichment API is returning a 500 error. This guide will help identify and fix the problem.

## 📋 **Step-by-Step Diagnosis**

### **Step 1: Test Health Check Endpoint**
```bash
curl "http://localhost:3000/api/admin/enrichment/health"
```
This will test all components individually and show which ones are failing.

### **Step 2: Test Simple Endpoint**
```bash
curl "http://localhost:3000/api/admin/enrichment/simple"
```
This tests basic API functionality without complex dependencies.

### **Step 3: Test Debug Endpoint**
```bash
curl "http://localhost:3000/api/admin/enrichment/debug"
```
This provides detailed information about what's failing.

## 🔍 **Common Issues & Solutions**

### **Issue 1: Database Connection Failed**
**Symptoms**: Database check fails in health endpoint
**Solutions**:
1. Check `DATABASE_URL` environment variable
2. Ensure PostgreSQL is running
3. Verify database credentials
4. Check if database exists

### **Issue 2: Module Import Failed**
**Symptoms**: Import checks fail in health endpoint
**Solutions**:
1. Run `npm run build` to rebuild modules
2. Check for TypeScript compilation errors
3. Verify import paths are correct
4. Restart development server

### **Issue 3: LLM Model Issues**
**Symptoms**: LLM model check fails
**Solutions**:
1. Check API keys for LLM services
2. Verify LLM service configuration
3. Check network connectivity to LLM services

### **Issue 4: Build/Compilation Errors**
**Symptoms**: Various import failures
**Solutions**:
1. Check terminal for build errors
2. Run `npm run build` and fix any errors
3. Check for missing dependencies
4. Verify TypeScript configuration

## 🧪 **Testing Commands**

### **Health Check**
```bash
curl "http://localhost:3000/api/admin/enrichment/health"
```

### **Simple Test**
```bash
curl -X POST "http://localhost:3000/api/admin/enrichment/simple" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'
```

### **Debug Information**
```bash
curl "http://localhost:3000/api/admin/enrichment/debug"
```

### **Main Endpoint Test**
```bash
curl -X POST "http://localhost:3000/api/admin/enrichment" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'
```

## 📊 **Expected Results**

### **Healthy System**
```json
{
  "status": "healthy",
  "message": "All checks passed",
  "checks": {
    "server": { "status": "healthy" },
    "environment": { "status": "healthy" },
    "database": { "status": "healthy" },
    "enrichmentEngine": { "status": "healthy" },
    "websiteScraper": { "status": "healthy" },
    "googleSearchEnricher": { "status": "healthy" },
    "llmModel": { "status": "healthy" }
  }
}
```

### **Unhealthy System**
```json
{
  "status": "unhealthy",
  "message": "2 checks failed",
  "checks": {
    "database": { "status": "unhealthy", "error": "Connection failed" },
    "llmModel": { "status": "unhealthy", "error": "API key missing" }
  }
}
```

## 🚀 **Quick Fixes**

### **Fix 1: Restart Development Server**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### **Fix 2: Rebuild Project**
```bash
npm run build
npm run dev
```

### **Fix 3: Check Environment Variables**
```bash
# Ensure these are set in .env.local
DATABASE_URL=postgresql://...
GOOGLE_CUSTOM_SEARCH_API_KEY=your_key_here
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_engine_id
```

### **Fix 4: Check Database Status**
```bash
# If using Docker
docker ps | grep postgres

# If using local PostgreSQL
sudo systemctl status postgresql
```

## 📝 **Log Analysis**

### **Server Logs**
Check the terminal where you're running `npm run dev` for:
- Import errors
- Database connection errors
- Module initialization errors

### **Browser Console**
Check browser developer tools for:
- Network request details
- Response error messages
- JavaScript errors

### **API Response Details**
The enhanced error responses now include:
- Specific error details
- Suggestions for fixing
- Component that failed

## 🎯 **Next Steps**

1. **Run health check** to identify failing components
2. **Check server logs** for detailed error information
3. **Verify environment variables** are properly set
4. **Test simple endpoints** to isolate the issue
5. **Fix identified problems** based on error messages
6. **Retest** the main enrichment endpoint

## 📞 **Getting Help**

If the issue persists after following this guide:

1. **Check the health endpoint output** and share the results
2. **Share server logs** from the terminal
3. **Share browser console errors** if any
4. **Describe what you've tried** so far

---

**🎯 Goal**: Get the health endpoint to return "All checks passed" before testing the main enrichment functionality.
