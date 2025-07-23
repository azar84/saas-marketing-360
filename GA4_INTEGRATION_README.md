# Google Analytics 4 (GA4) Integration

This document describes the GA4 integration implemented in the Saski AI website CMS.

## 🎯 Features Implemented

### ✅ Database Schema
- Added `gaMeasurementId` field to `SiteSettings` model
- Supports GA4 Measurement ID format: `G-XXXXXXXXXX`
- Optional field that can be null/empty

### ✅ Admin Panel Integration
- **Location**: SEO Manager → SEO Settings tab
- **Form Field**: "Google Analytics Measurement ID"
- **Validation**: Ensures proper GA4 format (G-XXXXXXXXXX)
- **Help Text**: Instructions on where to find the ID
- **Status Indicator**: Shows when GA4 is configured

### ✅ Frontend Implementation
- **Dynamic Script Injection**: Only loads GA4 when ID is configured
- **SPA Route Tracking**: Automatically tracks page changes in Next.js
- **Performance Optimized**: No impact when GA4 is not configured

## 🚀 How to Use

### 1. Get Your GA4 Measurement ID
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Go to **Admin** → **Data Streams**
4. Click on your web stream
5. Copy the **Measurement ID** (format: G-XXXXXXXXXX)

### 2. Configure in Admin Panel
1. Navigate to `/admin-panel`
2. Click **SEO Manager** in the navigation
3. Go to the **SEO Settings** tab
4. Enter your GA4 Measurement ID in the field
5. Click **Save GA Settings**

### 3. Verify Installation
1. Open your website in a browser
2. Open Developer Tools (F12)
3. Go to **Network** tab
4. Look for requests to `googletagmanager.com`
5. Check **Console** for any GA4 errors

## 🔧 Technical Implementation

### Database Schema
```sql
-- Added to SiteSettings table
gaMeasurementId String?  -- GA4 Measurement ID (G-XXXXXXXXXX)
```

### Frontend Components

#### GoogleAnalytics Component
```tsx
// src/components/layout/GoogleAnalytics.tsx
- Dynamically injects GA4 script
- Handles SPA route changes
- Only renders when GA4 ID is configured
```

#### Layout Integration
```tsx
// src/app/layout.tsx
- Fetches GA4 ID from database
- Passes to GoogleAnalytics component
- Handles errors gracefully
```

### API Endpoints
```typescript
// PUT /api/admin/site-settings
- Updates GA4 Measurement ID
- Validates format (G-XXXXXXXXXX)
- Returns success/error response
```

## 📊 Tracking Features

### Automatic Page Views
- ✅ Initial page load
- ✅ SPA navigation (route changes)
- ✅ Proper page paths

### GA4 Configuration
- ✅ Page view tracking
- ✅ Enhanced measurement
- ✅ Debug mode support

### Performance Optimizations
- ✅ Conditional loading (only when configured)
- ✅ No impact on Core Web Vitals
- ✅ Error handling for missing GA4

## 🛠️ Validation Rules

### GA4 Measurement ID Format
- **Pattern**: `G-XXXXXXXXXX`
- **Example**: `G-ABC123DEF4`
- **Validation**: Regex `/^G-[A-Z0-9]{10}$/`

### Error Handling
- Invalid format shows validation error
- Missing ID doesn't break the site
- Database errors are logged but don't crash

## 🔍 Testing

### Manual Testing
1. **Without GA4**: Site loads normally, no GA4 scripts
2. **With GA4**: Scripts load, page views tracked
3. **Invalid ID**: Validation error shown
4. **Route Changes**: Page views tracked on navigation

### Browser Testing
```javascript
// Check if GA4 is loaded
console.log(window.gtag); // Should be function if loaded

// Check dataLayer
console.log(window.dataLayer); // Should be array if loaded

// Manual page view test
gtag('config', 'G-XXXXXXXXXX', { page_path: '/test' });
```

## 🚨 Troubleshooting

### Common Issues

#### GA4 Not Loading
- Check if Measurement ID is saved in admin panel
- Verify ID format (G-XXXXXXXXXX)
- Check browser console for errors
- Ensure no ad blockers are blocking GA4

#### Page Views Not Tracking
- Verify GA4 is properly configured
- Check network tab for GA4 requests
- Ensure route changes are being detected
- Test with GA4 Debug mode

#### Validation Errors
- Ensure ID starts with "G-"
- Check ID is exactly 10 characters after "G-"
- Verify only uppercase letters and numbers
- Check browser console for detailed validation error messages

#### Save Settings Failing
- Check browser console for request/response details
- Verify GA4 ID format is correct (G-XXXXXXXXXX)
- Try clearing the field and re-entering the ID
- Check server logs for validation errors

### Debug Mode
```javascript
// Enable GA4 debug mode
gtag('config', 'G-XXXXXXXXXX', { debug_mode: true });
```

### Testing the Integration

1. **Open Browser Developer Tools** (F12)
2. **Go to Console tab**
3. **Try saving GA4 settings** and watch for:
   - Request being sent: `Sending GA settings: {gaMeasurementId: "G-XXXXXXXXXX"}`
   - Server response: `PUT /api/admin/site-settings - Request body: {...}`
   - Validation results: `PUT /api/admin/site-settings - Validated data: {...}`

4. **Check Network tab** for:
   - PUT request to `/api/admin/site-settings`
   - Response status (200 = success, 400 = validation error)
   - Response body for error details

## 📈 Analytics Setup

### Recommended GA4 Events
```javascript
// Custom events you can add
gtag('event', 'button_click', {
  button_name: 'cta_button',
  page_location: window.location.pathname
});

gtag('event', 'form_submit', {
  form_name: 'contact_form',
  page_location: window.location.pathname
});
```

### Enhanced Ecommerce (if needed)
```javascript
// For ecommerce tracking
gtag('event', 'purchase', {
  transaction_id: 'T_12345',
  value: 99.99,
  currency: 'USD'
});
```

## 🔒 Privacy & Compliance

### GDPR Considerations
- GA4 respects user privacy settings
- No personal data is sent to GA4 by default
- Consider adding cookie consent if required

### Data Retention
- GA4 default retention: 26 months
- Can be adjusted in GA4 settings
- No data stored locally

## 🎉 Success Metrics

### Implementation Checklist
- [ ] GA4 Measurement ID configured
- [ ] Script loads on page load
- [ ] Page views track on navigation
- [ ] No console errors
- [ ] Real-time data appears in GA4
- [ ] Performance not impacted

### Verification Steps
1. Check GA4 Real-Time reports
2. Verify page views in GA4 dashboard
3. Test route changes show as new page views
4. Confirm no performance degradation

---

**Note**: This integration provides a solid foundation for GA4 tracking. Additional custom events and enhanced ecommerce can be added as needed for specific business requirements. 