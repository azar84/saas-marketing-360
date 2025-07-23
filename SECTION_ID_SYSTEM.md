# Section ID System

## Overview
The dynamic page renderer now automatically assigns unique 3-digit IDs to each section for better navigation, analytics, and anchor linking.

## Implementation
Each dynamically rendered section gets wrapped with a div containing a unique ID in the format `section-XXX` where XXX is a 3-digit number.

### ID Generation Logic
```javascript
const generateSectionId = (section, index) => {
  // Use section.id padded to 3 digits, or fallback to index-based ID
  const baseId = section.id || (index + 1);
  return String(baseId).padStart(3, '0');
};
```

### Examples
- Section with database ID 1 → `section-001`
- Section with database ID 15 → `section-015` 
- Section with database ID 123 → `section-123`
- Section without ID (index 3) → `section-004`

## HTML Structure
```html
<div id="section-001">
  <section class="...">
    <!-- Section content -->
  </section>
</div>
```

## Use Cases
1. **Anchor Navigation**: `#section-001` for direct section linking
2. **Analytics**: Track section engagement by ID
3. **JavaScript**: `document.getElementById('section-001')` for DOM manipulation
4. **CSS**: `#section-001` for section-specific styling
5. **Testing**: Reliable selectors for automated testing

## Updated Components
- `DynamicPageRenderer.tsx` - Main implementation
- All section types wrapped with unique IDs:
  - Hero sections
  - Feature sections
  - Media sections
  - FAQ sections
  - Form sections
  - HTML sections
  - Pricing sections
  - CTA sections
  - Custom sections

## Benefits
- **SEO**: Better page structure for search engines
- **UX**: Enable smooth scrolling to specific sections
- **Development**: Easier debugging and testing
- **Analytics**: Track user interaction with specific sections
- **Accessibility**: Better screen reader navigation 