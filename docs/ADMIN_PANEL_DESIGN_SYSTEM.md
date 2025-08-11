
# Admin Panel Design System Guide

## Overview
This document defines the standardized styling patterns for the admin panel to ensure consistency across all components, forms, and interfaces.

---

## 🎨 Color System

### Background Colors
- **Main Container Background**: `Secondary Background`
- **Card Background**: `Primary Background`
- **Sidebar Background**: `Dark Background`
- **Table Header Background**: `Secondary Background`
- **Table Body Background**: `Primary Background`
- **Modal Background**: `Primary Background`
- **Disabled Background**: `Gray Light`

### Text Colors
- **Primary Text**: `Primary Text`
- **Secondary Text**: `Secondary Text`
- **Muted Text**: `Muted Text`
- **Success Text**: `Success Dark`
- **Error Text**: `Error Dark`
- **Warning Text**: `Warning Dark`
- **Disabled Text**: `Muted Text`

### Placeholder Text
Always use muted color:
```css
::placeholder {
  color: Muted Text;
}
```

### Border Colors
- **Default Border**: `Gray Light`
- **Focus Border**: `Primary`
- **Error Border**: `Error`
- **Success Border**: `Success`

### Button Colors
- **Primary**: `Primary` background, `Primary Background` text
- **Success**: `Success` background, `Primary Background` text
- **Error**: `Error` background, `Primary Background` text
- **Ghost**: `Primary Text` text, `Secondary Background` on hover
- **Disabled**: `Gray Light` background, `Muted Text` text

### Badge Colors
Use appropriate light/dark variants for active, inactive, info, warning, and success states.

---

## 🧩 Component Standards

### Form Labels
Use `Primary Text`

### Section Headers
Use `Primary Text`

### Page Headers
- Title: `Primary Text`
- Description: `Secondary Text`

### Card
- Background: `Primary Background`
- Border: `Gray Light`

### Table
- Header: `Secondary Background` and `Primary Text`
- Rows: `Primary Background`
- Hover: `Secondary Background`

### Input / Select
- Border: `Gray Light`
- Text: `Primary Text`
- Placeholder: `Muted Text`

### Status Messages
- Success: `Success Light` background, `Success Dark` text
- Error: `Error Light` background, `Error Dark` text

### Tab Navigation
- Active: `Primary` background, `Primary Background` text
- Inactive: `Primary Background` background, `Secondary Text` text

### Empty State
- Icon: `Muted Text`
- Title: `Primary Text`
- Description: `Secondary Text`

### Loading State
- Text: `Secondary Text`

### Modal Overlay
```css
background-color: rgba(0, 0, 0, 0.5);
```

### Icons
- Primary: `Primary`
- Secondary: `Secondary Text`
- Muted: `Muted Text`
- Success: `Success`
- Error: `Error`

### Pagination Controls
- Inactive: `Primary Background` background, `Secondary Text` text
- Active: `Primary` background, `Primary Background` text

---

## 🗂️ Tab Navigation — Design Guidelines

### Forms Management Tab Pattern
This is the standard tab pattern used in forms management and similar interfaces:

#### States & Parameters

| **State**        | **Background**         | **Text**             | **Border**           | **Notes**                                                 |
|------------------|------------------------|----------------------|----------------------|-----------------------------------------------------------|
| **Active Tab**   | `transparent`          | `Primary`            | `Primary` (bottom)   | Primary color text with bottom border                     |
| **Inactive Tab** | `transparent`          | `Secondary Text`     | `transparent`        | Muted text with no border                                 |
| **Hover State**  | `transparent`          | `Primary Text`       | —                    | Subtle text emphasis on hover                             |

#### Layout & Spacing
- **Container**: `border-b` with `Gray Light` border
- **Navigation**: `-mb-px flex space-x-8`
- **Tab Items**: `py-4 px-1 border-b-2 font-medium text-sm transition-colors`
- **Icons**: `mr-2 h-5 w-5 transition-colors`
- **Typography**: Medium font weight for clarity

#### Implementation Example
```tsx
<div className="border-b" style={{ borderColor: 'var(--color-gray-light)' }}>
  <nav className="-mb-px flex space-x-8">
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
          style={{
            borderColor: isActive ? 'var(--color-primary)' : 'transparent',
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'
          }}
        >
          <Icon
            className="mr-2 h-5 w-5 transition-colors"
            style={{
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'
            }}
          />
          {tab.name}
        </button>
      );
    })}
  </nav>
</div>
```

### Content Tab Pattern (Alternative)
For content-heavy interfaces like HTML sections manager:

#### States & Parameters

| **State**        | **Background**         | **Text**             | **Border**           | **Notes**                                                 |
|------------------|------------------------|----------------------|----------------------|-----------------------------------------------------------|
| **Active Tab**   | `Primary`              | `Background Primary` | `Primary` (bottom)   | High-contrast text on emphasized background               |
| **Inactive Tab** | `Background Primary`   | `Secondary Text`     | `transparent`        | Neutral tab background with subdued label                 |
| **Hover State**  | `Secondary Background` | `Primary Text`       | —                    | Slight background lift and increased text emphasis        |

---

## 🃏 Card-in-Card Background Patterns

### Page Builder Card Hierarchy
When cards are nested within other cards (like in page builder), use this background pattern:

#### Container Cards (Outer)
- **Background**: `Secondary Background`
- **Border**: `Gray Light`
- **Padding**: `p-6`
- **Border Radius**: `rounded-xl`
- **Shadow**: `shadow-sm`

#### Content Cards (Inner)
- **Background**: `Primary Background` (when active/visible)
- **Background**: `Secondary Background` (when inactive/hidden)
- **Border**: `Gray Light` (when active)
- **Border**: `Muted Text` (when inactive)
- **Padding**: `p-4`
- **Border Radius**: `rounded-lg`
- **Border Width**: `border-2`

#### Implementation Example
```tsx
// Container Card
<div 
  className="rounded-xl p-6 shadow-sm border"
  style={{ 
    backgroundColor: 'var(--color-bg-secondary)',
    borderColor: 'var(--color-gray-light)'
  }}
>
  {/* Content Cards */}
  <div
    className="rounded-lg border-2 transition-all duration-200"
    style={{
      backgroundColor: section.isVisible 
        ? 'var(--color-bg-primary)' 
        : 'var(--color-bg-secondary)',
      borderColor: section.isVisible 
        ? 'var(--color-gray-light)' 
        : 'var(--color-text-muted)',
      opacity: section.isVisible ? 1 : 0.6
    }}
  >
    {/* Card content */}
  </div>
</div>
```

### Card States
- **Active/Visible**: Full opacity, primary background, gray border
- **Inactive/Hidden**: Reduced opacity (0.6), secondary background, muted border
- **Dragging**: Scale transform (1.05), primary border, 0.9 opacity

---

## 🔁 Usage Rules

### Text Hierarchy
1. Primary – headings, labels
2. Secondary – descriptions
3. Muted – timestamps, placeholders, disabled

### Backgrounds
- Primary – cards, modals
- Secondary – layout backgrounds, table headers
- Dark – sidebar/nav
- Disabled – buttons/inputs

### Borders
- Default: general use
- Focus: active states
- Error/Success: validation feedback

---

## 🎯 CTA Components Library

### Overview
The admin panel provides a comprehensive collection of Call-to-Action components that follow the design system and ensure consistency across all interfaces. All components use design tokens for colors, typography, and spacing.

### Core Button Component
The foundation of all CTA components with 9 variants and 4 sizes.

#### Variants
- **`primary`** - Main actions (Submit, Save, Create)
- **`secondary`** - Secondary actions (Copy, Export)
- **`accent`** - Highlighted actions
- **`outline`** - Secondary actions (Cancel, Edit, Refresh)
- **`ghost`** - Subtle actions (Back, Close)
- **`destructive`** - Dangerous actions (Delete, Clear)
- **`success`** - Positive actions (Confirm, Approve)
- **`info`** - Informational actions
- **`muted`** - Disabled state

#### Sizes
- **`sm`** - `h-8 px-3` (32px height)
- **`md`** - `h-10 px-4` (40px height) - Default
- **`lg`** - `h-12 px-6` (48px height)
- **`xl`** - `h-14 px-8` (56px height)

#### Styling Guidelines
- **Text wrapping**: Automatically prevents text wrapping with `whitespace-nowrap`
- **Icon alignment**: Icons and text are properly aligned horizontally
- **Flexbox behavior**: Uses `flex-nowrap` to prevent layout issues
- **Gap spacing**: Consistent `gap-2` between icons and text
- **Focus states**: Accessible focus rings with design token colors
- **Hover effects**: Smooth transitions with scale transforms

#### Usage Example
```tsx
<Button variant="primary" size="md" onClick={handleSave}>
  <Save className="h-4 w-4" />
  Save Changes
</Button>
```

### IconButton Component
Square buttons for icon-only actions, perfect for data table rows and compact interfaces.

#### Features
- **Square aspect ratio** - All sizes maintain 1:1 ratio
- **Icon sizing** - Automatically scales icons based on button size
- **All button variants** - Supports all 9 button variants
- **Accessibility** - Proper ARIA labels and focus states
- **Text wrapping prevention** - Built-in `whitespace-nowrap` for consistency

#### Sizes
- **`sm`** - `h-8 w-8` (32x32px)
- **`md`** - `h-10 w-10` (40x40px) - Default
- **`lg`** - `h-12 w-12` (48x48px)
- **`xl`** - `h-14 w-14` (56x56px)

#### Styling Guidelines
- **Icon centering**: Icons are perfectly centered within the square button
- **Responsive sizing**: Icons automatically scale with button size
- **Hover effects**: Subtle scale transforms and background changes
- **Focus states**: Clear focus rings for accessibility
- **Variant consistency**: Same color scheme as regular buttons

#### Usage Example
```tsx
<IconButton variant="ghost" size="sm" onClick={handleEdit}>
  <Edit className="h-4 w-4" />
</IconButton>
```

### LinkButton Component
Navigation buttons that handle both internal and external links with proper styling.

#### Features
- **Internal routing** - Uses Next.js Link for internal navigation
- **External links** - Automatically opens in new tab with security attributes
- **Icon support** - Left/right icons and optional arrow indicators
- **All button variants** - Consistent with Button component
- **Text wrapping prevention** - Built-in `whitespace-nowrap` for consistency

#### Props
- **`href`** - Required link destination
- **`external`** - Boolean for external links
- **`showArrow`** - Adds right arrow icon
- **`leftIcon`** / **`rightIcon`** - Icon components
- **`style`** - Optional custom CSS properties

#### Styling Guidelines
- **Link behavior**: Proper cursor pointer and hover states
- **Icon alignment**: Icons and text are horizontally aligned
- **Arrow indicators**: External links show arrow icons automatically
- **Security attributes**: External links include `rel="noopener noreferrer"`
- **Responsive design**: Adapts to different screen sizes

#### Usage Example
```tsx
<LinkButton 
  href="/dashboard" 
  variant="primary" 
  showArrow
  leftIcon={<Settings className="h-4 w-4" />}
>
  Go to Dashboard
</LinkButton>
```

### ActionGroup Component
Organizes related actions together with consistent spacing and alignment.

#### Features
- **Orientation** - Horizontal or vertical layout
- **Spacing** - Small, medium, or large gaps between actions
- **Alignment** - Start, center, or end alignment
- **Justification** - Start, center, end, between, or around distribution
- **Responsive design** - Adapts to different screen sizes

#### Props
- **`orientation`** - `'horizontal' | 'vertical'`
- **`spacing`** - `'sm' | 'md' | 'lg'`
- **`align`** - `'start' | 'center' | 'end'`
- **`justify`** - `'start' | 'center' | 'end' | 'between' | 'around'`
- **`fullWidth`** - Boolean for full-width layout

#### Styling Guidelines
- **Consistent spacing**: Uses standardized gap values across all orientations
- **Flexbox layout**: Leverages CSS flexbox for reliable alignment
- **Responsive behavior**: Automatically adjusts for mobile and desktop
- **Accessibility**: Maintains proper tab order and focus management
- **Visual hierarchy**: Clear separation between action groups

#### Usage Example
```tsx
<ActionGroup orientation="horizontal" spacing="md" justify="between">
  <Button variant="outline">Cancel</Button>
  <Button variant="primary">Save</Button>
</ActionGroup>
```

### FloatingActionButton Component
Primary actions that float above content, commonly used for main actions.

#### Features
- **6 positions** - All corners and center positions
- **Tooltip support** - Optional hover tooltips with smart positioning
- **Hover effects** - Scale and shadow animations
- **Accessibility** - Proper focus and keyboard navigation
- **Text wrapping prevention** - Built-in `whitespace-nowrap` for consistency

#### Positions
- **`bottom-right`** - Default position
- **`bottom-left`** - Left side
- **`top-right`** - Top right corner
- **`top-left`** - Top left corner
- **`bottom-center`** - Bottom center
- **`top-center`** - Top center

#### Styling Guidelines
- **Fixed positioning**: Uses `position: fixed` for consistent placement
- **Z-index management**: Proper layering above other content
- **Shadow effects**: Subtle shadows for depth and prominence
- **Hover animations**: Scale transforms and shadow changes
- **Responsive behavior**: Adapts to different screen sizes
- **Tooltip positioning**: Smart tooltip placement to avoid viewport edges

#### Usage Example
```tsx
<FloatingActionButton
  variant="primary"
  size="md"
  position="bottom-right"
  tooltip="Add new item"
  showTooltip={true}
  onClick={handleAdd}
>
  <Plus className="h-5 w-5" />
</FloatingActionButton>
```

### ProgressButton Component
Buttons that show progress states and loading indicators.

#### Features
- **Progress bar** - Visual progress indicator overlay
- **Loading states** - Spinner with custom loading text
- **Icon support** - Left/right icons
- **All button variants** - Consistent styling
- **Text wrapping prevention** - Built-in `whitespace-nowrap` for consistency

#### Props
- **`progress`** - Number 0-100 for progress bar
- **`isLoading`** - Boolean for loading state
- **`loadingText`** - Custom text during loading
- **`showProgressBar`** - Toggle progress bar visibility
- **`progressBarColor`** - Custom progress bar color

#### Styling Guidelines
- **Progress overlay**: Semi-transparent progress bar with smooth animations
- **Loading spinner**: Animated spinner with proper sizing
- **State transitions**: Smooth transitions between normal, loading, and progress states
- **Progress visualization**: Clear visual feedback for user actions
- **Accessibility**: Proper ARIA labels for screen readers
- **Responsive design**: Adapts to different button sizes

#### Usage Example
```tsx
<ProgressButton 
  variant="primary" 
  progress={uploadProgress}
  isLoading={isUploading}
  loadingText="Uploading..."
  leftIcon={<Upload className="h-4 w-4" />}
>
  Upload Files
</ProgressButton>
```

### Badge Component
Status indicators and labels that provide visual feedback for different states.

#### Features
- **Multiple variants** - Default, secondary, outline, success, warning, error
- **Size options** - Small, medium, and large sizes
- **Dynamic colors** - Uses design system color tokens
- **Accessibility** - Proper contrast ratios and semantic meaning

#### Variants
- **`default`** - Primary status indicators
- **`secondary`** - Secondary information
- **`outline`** - Subtle status with borders
- **`success`** - Positive states (Active, Approved)
- **`warning`** - Caution states (Pending, Draft)
- **`error`** - Error states (Failed, Rejected)
- **`info`** - Informational states

#### Sizes
- **`sm`** - `text-xs px-2 py-1` (Compact)
- **`md`** - `text-sm px-3 py-1.5` (Default)
- **`lg`** - `text-base px-4 py-2` (Large)

#### Styling Guidelines
- **Color tokens**: All colors use CSS variables from design system
- **Dynamic styling**: Colors automatically adapt based on variant
- **Border handling**: Outline variants have proper border colors
- **Text contrast**: Ensures readable text on all background colors
- **Hover effects**: Subtle opacity changes on interactive badges

#### Usage Example
```tsx
<Badge variant="success" size="sm">
  Active
</Badge>

<Badge variant="outline" size="md">
  Draft
</Badge>
```

### SplitButton Component
Buttons with dropdown options for related actions.

#### Features
- **Main action** - Primary button with icon support
- **Dropdown options** - Secondary actions with variants
- **Smart positioning** - Top or bottom dropdown
- **Keyboard navigation** - Escape key closes dropdown
- **Click outside** - Automatically closes on outside clicks
- **Text wrapping prevention** - Built-in `whitespace-nowrap` for consistency

#### Props
- **`mainAction`** - Primary button configuration
- **`options`** - Array of dropdown options
- **`dropdownPosition`** - `'top' | 'bottom'`
- **`maxHeight`** - Custom dropdown height

#### Styling Guidelines
- **Dropdown positioning**: Smart positioning to avoid viewport edges
- **Option variants**: Each option can have different visual styles
- **Keyboard support**: Full keyboard navigation with arrow keys
- **Focus management**: Proper focus handling for accessibility
- **Animation**: Smooth dropdown open/close transitions

#### Usage Example
```tsx
<SplitButton
  variant="primary"
  mainAction={{
    label: "Export",
    onClick: handleExport,
    icon: <Download className="h-4 w-4" />
  }}
  options={[
    {
      label: "Export as CSV",
      onClick: handleCSVExport,
      icon: <Download className="h-4 w-4" />
    },
    {
      label: "Export as JSON",
      onClick: handleJSONExport,
      icon: <Download className="h-4 w-4" />
    }
  ]}
/>
```

### Component Selection Guidelines

#### When to Use Each Component

| **Use Case**                    | **Component**           | **Example**                    |
|--------------------------------|------------------------|--------------------------------|
| **Primary actions**            | `Button`               | Save, Submit, Create          |
| **Icon-only actions**          | `IconButton`           | Edit, Delete, View            |
| **Navigation**                  | `LinkButton`           | Go to page, External links   |
| **Related actions**             | `ActionGroup`          | Form buttons, Toolbar         |
| **Main page actions**          | `FloatingActionButton` | Add new, Quick settings      |
| **Progress states**             | `ProgressButton`       | Upload, Download, Processing |
| **Multiple options**            | `SplitButton`          | Export formats, Bulk actions  |

#### Design System Compliance
- **Colors** - All components use design token variables (`var(--color-...)`)
- **Typography** - Consistent font sizes and weights from design system
- **Spacing** - Standardized padding and margins (`gap-2`, `px-3`, `py-1`)
- **Borders** - Consistent border radius (`rounded-md`, `rounded-lg`) and colors
- **Focus states** - Accessible focus rings with design token colors
- **Hover effects** - Smooth transitions and state changes
- **Text wrapping** - Automatic `whitespace-nowrap` prevention
- **Icon alignment** - Consistent horizontal alignment of icons and text

#### Accessibility Features
- **Keyboard navigation** - All components support Tab and Enter keys
- **Screen readers** - Proper ARIA labels and descriptions
- **Focus management** - Clear focus indicators with design tokens
- **Color contrast** - Meets WCAG accessibility standards
- **Semantic HTML** - Proper button and link elements
- **Focus rings** - Visible focus states for keyboard users
- **ARIA attributes** - Proper roles and states for assistive technologies

#### Styling Best Practices
- **Use variants consistently** - Choose appropriate variants for action types
- **Icon placement** - Left icons for primary actions, right icons for navigation
- **Size selection** - Use appropriate sizes for context (sm for tables, lg for headers)
- **Spacing consistency** - Maintain consistent gaps between related elements
- **Color semantics** - Use destructive for dangerous actions, success for positive actions
- **Responsive design** - Ensure buttons work well on all screen sizes

---

## 🔧 CTA Component Troubleshooting

### Common Issues and Solutions

#### Text Wrapping Problems
**Problem**: Button text wraps to multiple lines
**Solution**: Remove any `flex items-center gap-2` classes from Button instances. The Button component now handles text wrapping automatically with built-in `whitespace-nowrap`.

#### Icon Alignment Issues
**Problem**: Icons and text appear on different lines
**Solution**: The Button component now handles icon alignment internally. Ensure no conflicting flex classes are applied to Button instances.

#### Inconsistent Button Styling
**Problem**: Buttons look different across the interface
**Solution**: Use Button component variants instead of custom styling:
- Use `variant="destructive"` instead of custom error colors
- Use `variant="success"` instead of custom success colors
- Use `variant="outline"` for secondary actions

#### Missing Hover Effects
**Problem**: Buttons don't show hover states
**Solution**: Ensure Button components are used instead of plain HTML buttons. All variants include proper hover effects.

#### Accessibility Issues
**Problem**: Buttons not accessible to screen readers
**Solution**: Always provide descriptive text or ARIA labels for IconButton components.

### Best Practices for CTA Implementation

1. **Always use Button components** instead of HTML buttons
2. **Choose appropriate variants** for action types
3. **Use consistent sizing** across related actions
4. **Provide clear labels** for all actions
5. **Group related actions** using ActionGroup component
6. **Test keyboard navigation** for all CTAs
7. **Ensure proper contrast** for all button states

---

## ✅ Implementation Checklist

### General Design System
- [ ] All text uses design tokens
- [ ] All backgrounds use design tokens
- [ ] All borders use design tokens
- [ ] No hardcoded colors
- [ ] Placeholder text uses muted
- [ ] Tabs follow state logic
- [ ] Hover/focus states styled
- [ ] Empty/loading states compliant
- [ ] Card-in-card backgrounds follow hierarchy
- [ ] Tab navigation uses correct pattern for context

### CTA Components
- [ ] CTA components use appropriate variants
- [ ] All buttons prevent text wrapping automatically
- [ ] Icons and text are properly aligned horizontally
- [ ] Icon buttons have proper accessibility labels
- [ ] Link buttons handle internal/external routing correctly
- [ ] Action groups maintain consistent spacing
- [ ] Floating action buttons have proper positioning
- [ ] Progress buttons show clear loading states
- [ ] Split buttons have accessible dropdown options
- [ ] Badge components use design system colors
- [ ] Button variants match action semantics (destructive for delete, success for confirm)
- [ ] Consistent spacing between related CTA elements
- [ ] Proper focus states for keyboard navigation
- [ ] Hover effects provide clear visual feedback
- [ ] Loading states are clearly indicated
- [ ] Disabled states are visually distinct
- [ ] All CTAs use design system color tokens
- [ ] No conflicting flex classes on Button components
- [ ] Proper icon sizing for each button size
- [ ] Consistent border radius across all components

