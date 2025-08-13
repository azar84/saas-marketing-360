# 🚀 Enrichment Manager Troubleshooting Guide

## 🎯 **Quick Fix: URL Protocol Handling**

**NEW FIX IMPLEMENTED!** The system now automatically handles URLs with or without protocols:
- ✅ `example.com` → automatically adds `https://`
- ✅ `https://example.com` → works as expected
- ✅ `http://example.com` → works as expected
- ✅ `www.example.com` → automatically removes `www.` prefix

**If you were getting 500 errors due to URL format issues, this should now be resolved!**

## 🔍 **Test Health Check Endpoint**

First, test if the enrichment system is healthy:

```bash
curl "http://localhost:3000/api/admin/enrichment/health"
```

**Expected Result:**
```json
{
  "status": "healthy",
  "checks": {
    "server": "ok",
    "environment": "ok",
    "database": "ok",
    "modules": "ok"
  }
}
```

## 🧪 **Test Simple Endpoint**

Test basic API functionality without full enrichment:

```bash
curl -X POST "http://localhost:3000/api/admin/enrichment/simple" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Simple enrichment test completed successfully",
  "data": { ... }
}
```

## 🐛 **Test Debug Endpoint**

Get detailed debugging information:

```bash
curl "http://localhost:3000/api/admin/enrichment/debug"
```

**Expected Result:**
```json
{
  "tests": {
    "EnrichmentEngine": "✅ Imported successfully",
    "WebsiteScraper": "✅ Imported successfully",
    "GoogleSearchEnricher": "✅ Imported successfully",
    "EnrichmentProcessor": "✅ Imported successfully",
    "Database": "✅ Connected successfully",
    "LLM": "✅ Configured successfully"
  }
}
```

## 🔧 **Test URL Normalization**

Test the new URL normalization logic:

```bash
node scripts/test-url-normalization.js
```

**Expected Result:**
```
🧪 Testing URL Normalization Logic

Input URL -> Normalized Domain:
================================
"example.com" -> "example.com"
"https://example.com" -> "example.com"
"http://example.com" -> "example.com"
"www.example.com" -> "example.com"
"https://www.example.com" -> "example.com"
```

## 🚨 **Common Issues & Solutions**

### **1. Database Connection Issues**
**Symptoms:** `Database connection failed` error
**Solution:** Check your `.env.local` file:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

### **2. Module Import Issues**
**Symptoms:** `Failed to import enrichment engine` error
**Solution:** Rebuild the project:
```bash
npm run build
npm run dev
```

### **3. LLM Configuration Issues**
**Symptoms:** `LLM processing failed` error
**Solution:** Check environment variables:
```bash
OPENAI_API_KEY=your_openai_key_here
```

### **4. URL Format Issues**
**Symptoms:** `Invalid domain` or scraping failures
**Solution:** ✅ **FIXED** - System now automatically normalizes URLs

## 📋 **Testing Commands**

### **Quick Health Check:**
```bash
curl "http://localhost:3000/api/admin/enrichment/health"
```

### **Test Simple Enrichment:**
```bash
curl -X POST "http://localhost:3000/api/admin/enrichment/simple" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'
```

### **Test URL Normalization:**
```bash
node scripts/test-url-normalization.js
```

### **Test Full Enrichment (from admin panel):**
1. Go to Admin Panel → Enrichment Manager
2. Enter a domain (with or without https://)
3. Click "Start Enrichment"

## 🎯 **Expected Results**

### **✅ Healthy System:**
- Health check returns `status: "healthy"`
- Simple endpoint returns success
- Debug endpoint shows all ✅ marks
- URL normalization handles all formats

### **❌ Unhealthy System:**
- Health check shows specific failures
- Error responses include detailed information
- Debug endpoint shows ❌ marks for failed components

## 🚀 **Quick Fixes**

### **If Database is Down:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start if needed
brew services start postgresql
```

### **If Build is Broken:**
```bash
# Clean and rebuild
rm -rf .next
npm run build
npm run dev
```

### **If Environment Variables Missing:**
```bash
# Check your .env.local file
cat .env.local

# Should include:
# DATABASE_URL=postgresql://...
# OPENAI_API_KEY=sk-...
```

## 📊 **Log Analysis**

### **Server Logs (Terminal):**
Look for these patterns:
- `📦 Attempting to import EnrichmentEngine...`
- `🗄️ Testing database connection...`
- `🔧 Initializing EnrichmentEngine...`
- `🚀 Executing enrichment workflow...`

### **Error Patterns:**
- **Import Error:** `Failed to import enrichment engine`
- **Database Error:** `Database connection failed`
- **Init Error:** `Failed to initialize enrichment engine`
- **Execution Error:** `Enrichment execution failed`

## 🎉 **Success Indicators**

When everything is working:
1. ✅ Health check passes
2. ✅ Simple endpoint works
3. ✅ Debug endpoint shows all green
4. ✅ URL normalization handles all formats
5. ✅ Full enrichment completes successfully
6. ✅ Database records are created/updated

## 🆘 **Still Having Issues?**

If you're still getting errors after trying these steps:

1. **Share the specific error message** from the enhanced API
2. **Run the health check** and share results
3. **Check your terminal logs** for detailed error information
4. **Verify environment variables** are set correctly

The enhanced error handling will now give you **specific details** about what's failing instead of generic 500 errors!
