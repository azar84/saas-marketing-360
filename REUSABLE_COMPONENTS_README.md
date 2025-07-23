# Reusable Components System

This document outlines the new reusable components system that eliminates code duplication across all admin panel managers.

## 🎯 Goals

- **No More Reinventing the Wheel**: One component, multiple uses
- **Consistent UI/UX**: Standardized forms and layouts across all managers
- **Faster Development**: Import and use, no custom implementation needed
- **Maintainable Code**: Changes in one place affect all managers

## 📦 Available Components

### 1. FormField Component

A universal form field component that handles all common input types.

```tsx
import { FormField } from '@/components/ui';

// Usage examples:
<FormField
  label="Button Text"
  type="text"
  value={formData.text}
  onChange={(value) => setFormData({ ...formData, text: value as string })}
  placeholder="Enter button text"
  required
/>

<FormField
  label="Icon"
  type="icon"
  value={formData.icon}
  onChange={(value) => setFormData({ ...formData, icon: value as string })}
  placeholder="Select an icon"
/>

<FormField
  label="Style"
  type="select"
  value={formData.style}
  onChange={(value) => setFormData({ ...formData, style: value as any })}
  options={[
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' }
  ]}
/>

<FormField
  label="Active"
  type="checkbox"
  value={formData.isActive}
  onChange={(value) => setFormData({ ...formData, isActive: value as boolean })}
/>
```

**Supported Types:**
- `text` - Text input
- `email` - Email input
- `password` - Password input
- `number` - Number input
- `url` - URL input
- `textarea` - Multi-line text
- `select` - Dropdown selection
- `icon` - Icon picker
- `checkbox` - Boolean toggle

### 2. ManagerCard Component

A consistent card layout for all manager forms with built-in actions.

```tsx
import { ManagerCard } from '@/components/ui';

<ManagerCard
  title="Create New CTA Button"
  subtitle="Configure your call-to-action button"
  onSave={handleSubmit}
  onCancel={resetForm}
  isLoading={isSubmitting}
  actions={
    <Button variant="outline" size="sm">
      Preview
    </Button>
  }
>
  {/* Your form fields go here */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <FormField ... />
    <FormField ... />
  </div>
</ManagerCard>
```

**Features:**
- Consistent header with title and subtitle
- Built-in save/cancel buttons
- Loading states
- Custom actions support
- Responsive design

### 3. IconPicker Component

The unified icon picker (now the default `IconPicker` export).

```tsx
import { IconPicker } from '@/components/ui';

<IconPicker
  value={selectedIcon}
  onChange={setSelectedIcon}
  placeholder="Select an icon"
  className="w-full"
/>
```

**Features:**
- Multiple icon libraries (Lucide, Font Awesome, Material Design, etc.)
- Search functionality
- Grid and list views
- Preview mode
- Consistent API across all managers

## 🔄 Migration Guide

### Before (Old Way)
```tsx
// Each manager had its own form implementation
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Button Text *
    </label>
    <Input
      type="text"
      value={formData.text}
      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
      placeholder="Enter button text"
      required
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Icon
    </label>
    <UniversalIconPicker
      value={formData.icon}
      onChange={(iconName) => setFormData({ ...formData, icon: iconName })}
      placeholder="Select an icon"
    />
  </div>
</div>
```

### After (New Way)
```tsx
// Clean, reusable components
<ManagerCard
  title="Create New CTA Button"
  onSave={handleSubmit}
  onCancel={resetForm}
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <FormField
      label="Button Text"
      type="text"
      value={formData.text}
      onChange={(value) => setFormData({ ...formData, text: value as string })}
      placeholder="Enter button text"
      required
    />
    
    <FormField
      label="Icon"
      type="icon"
      value={formData.icon}
      onChange={(value) => setFormData({ ...formData, icon: value as string })}
      placeholder="Select an icon"
    />
  </div>
</ManagerCard>
```

## 📋 Implementation Checklist

### For Each Manager:

1. **Update Imports**
   ```tsx
   import { 
     Button, 
     FormField, 
     ManagerCard, 
     IconPicker,
     Card,
     Badge 
   } from '@/components/ui';
   ```

2. **Replace Form Fields**
   - Replace custom input groups with `FormField` components
   - Use appropriate `type` for each field
   - Maintain existing state management

3. **Wrap Form in ManagerCard**
   - Replace custom form containers with `ManagerCard`
   - Use `onSave` and `onCancel` props
   - Add loading states if needed

4. **Update Icon Usage**
   - Replace old `IconPicker` with new unified one
   - Use `renderIcon` utility for displaying icons

## 🎨 Benefits

### Code Reduction
- **Before**: ~200 lines per manager for forms
- **After**: ~50 lines per manager for forms
- **Savings**: 75% reduction in form code

### Consistency
- All managers now have identical form styling
- Consistent validation and error handling
- Unified user experience

### Maintainability
- Changes to form styling affect all managers
- Bug fixes in one place
- New features automatically available everywhere

### Developer Experience
- Faster development of new managers
- Less boilerplate code
- Easier to understand and modify

## 📁 File Structure

```
src/components/ui/
├── FormField.tsx          # Universal form field component
├── ManagerCard.tsx        # Manager layout wrapper
├── UniversalIconPicker.tsx # Unified icon picker
├── index.ts              # Centralized exports
└── ... (other components)

src/app/admin-panel/components/
├── CTAManagerSimplified.tsx  # Example of new approach
├── CTAManager.tsx           # Original (to be migrated)
└── ... (other managers)
```

## 🚀 Next Steps

1. **Migrate Existing Managers**
   - CTA Manager ✅ (example created)
   - FAQ Categories Manager
   - Media Sections Manager
   - Configurable Pricing Manager
   - Form Builder
   - Features Manager

2. **Add More Field Types**
   - Date picker
   - Color picker
   - File upload
   - Rich text editor

3. **Enhance ManagerCard**
   - Add tabs support
   - Add breadcrumbs
   - Add progress indicators

4. **Create More Specialized Components**
   - DataTable for lists
   - FilterBar for search/filter
   - StatusIndicator for states

## 💡 Best Practices

1. **Always use FormField for inputs** - Don't create custom input groups
2. **Use ManagerCard for forms** - Provides consistent layout and actions
3. **Import from index.ts** - Ensures you get the latest versions
4. **Maintain existing state management** - Only change the UI components
5. **Test thoroughly** - Ensure all functionality works after migration

## 🔧 Troubleshooting

### Common Issues:

1. **Type Errors**: Ensure proper type casting for onChange handlers
2. **Styling Conflicts**: ManagerCard provides its own styling, remove custom styles
3. **Icon Rendering**: Use `renderIcon` utility for displaying selected icons
4. **Form Validation**: FormField handles basic validation, add custom logic as needed

### Getting Help:

- Check the example in `CTAManagerSimplified.tsx`
- Review the component source code
- Test in the development environment first

---

**Remember**: The goal is to write less code while maintaining all functionality. These components are designed to handle 90% of use cases, with room for customization when needed. 