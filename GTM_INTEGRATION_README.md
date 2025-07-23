# Google Tag Manager (GTM) Integration

This document describes the GTM integration implemented in the Saski AI website CMS.

## 🎯 Features Implemented

### ✅ Database Schema
- Added `gtmContainerId` field to `SiteSettings` model (String, optional)
- Added `gtmEnabled` field to `SiteSettings` model (Boolean, default: false)
- Supports GTM Container ID format: `GTM-XXXXXX`

### ✅ Admin Panel Integration
- **Location**: SEO Manager → SEO Settings tab
- **Form Fields**: 
  - "GTM Container ID" (text input)
  - "Enable GTM" (checkbox toggle)
- **Validation**: Ensures proper GTM format (GTM-XXXXXX)
- **Help Text**: Instructions on where to find the Container ID
- **Status Indicator**: Shows when GTM is configured and enabled

### ✅ Frontend Implementation
- **Dynamic Script Injection**: Only loads GTM when enabled and ID is configured
- **Head Script**: Injects GTM script in `<head>` section
- **Body Script**: Injects noscript fallback immediately after `<body>` tag
- **Performance Optimized**: No impact when GTM is disabled

## 🔧 How to Use

### 1. Configure GTM in Admin Panel
1. Go to **Admin Panel** → **SEO Manager** → **SEO Settings**
2. Find the **"Google Tag Manager"** section
3. Enter your GTM Container ID (format: GTM-XXXXXX)
4. Check the **"Enable GTM"** checkbox
5. Click **"Save GTM Settings"**

### 2. Verify GTM is Working
1. Visit your website
2. Open browser developer tools
3. Check for:
   - GTM script loaded in `<head>`
   - `dataLayer` object in console
   - GTM noscript iframe in `<body>`
4. Use **Tag Assistant Legacy** Chrome extension to verify

## 📋 GTM Scripts Injected

### Head Script (gtm.js)
```html
<!-- Google Tag Manager -->
<script>
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');
</script>
<!-- End Google Tag Manager -->
```

### Body Script (noscript)
```html
<!-- Google Tag Manager (noscript) -->
<noscript>
<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>
<!-- End Google Tag Manager (noscript) -->
```

## 🚨 Troubleshooting

### Common Issues

#### GTM Not Loading
- Check if GTM is enabled in admin panel
- Verify Container ID format (GTM-XXXXXX)
- Check browser console for errors
- Ensure no ad blockers are blocking GTM

#### Container ID Validation Errors
- Ensure ID starts with "GTM-"
- Check ID is exactly 6 characters after "GTM-"
- Verify only uppercase letters and numbers

#### Script Not Injecting
- Verify both `gtmEnabled` and `gtmContainerId` are set
- Check if site settings are being fetched correctly
- Ensure no JavaScript errors in console

### Debug Mode
```javascript
// Enable GTM debug mode in browser console
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({'event': 'debug_mode'});
```

## 🔄 API Endpoints

### Update GTM Settings
- **Method**: PUT
- **Endpoint**: `/api/admin/site-settings`
- **Body**: 
  ```json
  {
    "gtmContainerId": "GTM-XXXXXX",
    "gtmEnabled": true
  }
  ```

### Get Site Settings
- **Method**: GET
- **Endpoint**: `/api/admin/site-settings`
- **Response**: Includes `gtmContainerId` and `gtmEnabled` fields

## 📁 Files Modified

1. **Database Schema**: `prisma/schema.prisma`
2. **Validation**: `src/lib/validations.ts`
3. **Admin Panel**: `src/app/admin-panel/components/SEOManager.tsx`
4. **Frontend Components**: `src/components/layout/GoogleTagManager.tsx`
5. **Layout**: `src/app/layout.tsx`

## 🎉 Benefits

- **Centralized Tag Management**: Manage all tracking tags from GTM
- **No Code Changes**: Add/remove tags without touching code
- **Performance**: Only loads when enabled
- **Flexibility**: Easy to enable/disable without code deployment
- **Compliance**: Proper noscript fallback for accessibility

## 🔗 Related Features

- **Google Analytics 4**: Can be configured through GTM
- **SEO Management**: Part of the comprehensive SEO toolkit
- **Site Settings**: Integrated with existing settings management 