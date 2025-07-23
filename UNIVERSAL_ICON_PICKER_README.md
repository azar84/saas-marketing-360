# Universal Icon Picker

A comprehensive React component that provides access to multiple icon libraries through a single, user-friendly interface. The Universal Icon Picker supports both Lucide React and React Icons libraries, making it easy to browse, search, and select icons for your application.

## Features

- **Multiple Icon Libraries**: Support for Lucide React, Font Awesome, Material Design, Ionicons, and Bootstrap icons
- **Search Functionality**: Real-time search across all icon libraries
- **Grid and List Views**: Toggle between grid and list display modes
- **Library Selection**: Switch between different icon libraries
- **Preview Mode**: See selected icons in the picker interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **TypeScript Support**: Full TypeScript support with proper type definitions
- **Customizable**: Highly customizable with props for styling and behavior

## Installation

The Universal Icon Picker requires the following dependencies:

```bash
npm install react-icons lucide-react framer-motion
```

## Usage

### Basic Usage

```tsx
import React, { useState } from 'react';
import UniversalIconPicker from '@/components/ui/UniversalIconPicker';
import { renderIcon } from '@/lib/iconUtils';

const MyComponent = () => {
  const [selectedIcon, setSelectedIcon] = useState<string>('lucide:home');

  const handleIconChange = (iconName: string, iconComponent: React.ComponentType<any>, library: string) => {
    setSelectedIcon(iconName);
    console.log('Selected icon:', iconName, 'from library:', library);
  };

  return (
    <div>
      <UniversalIconPicker
        value={selectedIcon}
        onChange={handleIconChange}
        placeholder="Choose an icon..."
      />
      
      {/* Render the selected icon */}
      {selectedIcon && renderIcon(selectedIcon, { className: 'w-6 h-6 text-blue-600' })}
    </div>
  );
};
```

### Advanced Usage

```tsx
import React, { useState } from 'react';
import UniversalIconPicker from '@/components/ui/UniversalIconPicker';
import { renderIcon } from '@/lib/iconUtils';

const AdvancedExample = () => {
  const [icon, setIcon] = useState<string>('react-icons-fa:FaHome');

  return (
    <div className="space-y-4">
      <UniversalIconPicker
        value={icon}
        onChange={(iconName, iconComponent, library) => setIcon(iconName)}
        placeholder="Select an icon for your feature..."
        className="w-full max-w-md"
        disabled={false}
        showPreview={true}
        maxHeight="500px"
      />
      
      <div className="flex items-center space-x-2">
        <span>Selected:</span>
        {icon && renderIcon(icon, { className: 'w-8 h-8 text-green-600' })}
        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
          {icon}
        </code>
      </div>
    </div>
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | The currently selected icon in format "library:iconName" |
| `onChange` | `(iconName: string, iconComponent: React.ComponentType<any>, library: string) => void` | - | Callback function when an icon is selected |
| `placeholder` | `string` | `"Search icons..."` | Placeholder text for the picker |
| `className` | `string` | `""` | Additional CSS classes for styling |
| `disabled` | `boolean` | `false` | Whether the picker is disabled |
| `showPreview` | `boolean` | `true` | Whether to show icon preview in the trigger button |
| `maxHeight` | `string` | `"400px"` | Maximum height of the dropdown |

## Icon Format

Icons are stored in the format `"library:iconName"`:

- `lucide:home` - Lucide React icon
- `react-icons-fa:FaHome` - Font Awesome icon
- `react-icons-md:MdSearch` - Material Design icon
- `react-icons-io:IoHeart` - Ionicons
- `react-icons-bi:BiUser` - Bootstrap icons

## Utility Functions

The `iconUtils.ts` file provides several utility functions:

### `renderIcon(iconString, props)`

Renders an icon from an icon string with optional props:

```tsx
import { renderIcon } from '@/lib/iconUtils';

// Render with custom props
renderIcon('lucide:home', { 
  className: 'w-6 h-6 text-blue-600',
  onClick: () => console.log('Icon clicked')
})
```

### `getIconComponent(iconString)`

Gets the React component for an icon string:

```tsx
import { getIconComponent } from '@/lib/iconUtils';

const IconComponent = getIconComponent('lucide:home');
if (IconComponent) {
  return <IconComponent className="w-6 h-6" />;
}
```

### `searchIcons(searchTerm, limit)`

Search for icons across all libraries:

```tsx
import { searchIcons } from '@/lib/iconUtils';

const results = searchIcons('home', 10);
// Returns array of { library, iconName, component }
```

### `getPopularIcons()`

Get a list of popular icons for quick selection:

```tsx
import { getPopularIcons } from '@/lib/iconUtils';

const popularIcons = getPopularIcons();
// Returns array of popular icon objects
```

### `isValidIconString(iconString)`

Validate if an icon string is in the correct format:

```tsx
import { isValidIconString } from '@/lib/iconUtils';

const isValid = isValidIconString('lucide:home'); // true
const isInvalid = isValidIconString('invalid'); // false
```

### `convertIconFormat(oldIcon)`

Convert old icon format to new format:

```tsx
import { convertIconFormat } from '@/lib/iconUtils';

const newFormat = convertIconFormat('home'); // Returns 'lucide:home'
```

## Supported Icon Libraries

### Lucide React
- **Prefix**: `lucide`
- **Description**: Beautiful & consistent icons
- **Example**: `lucide:home`, `lucide:user`, `lucide:settings`

### Font Awesome (React Icons)
- **Prefix**: `react-icons-fa`
- **Description**: Font Awesome icons
- **Example**: `react-icons-fa:FaHome`, `react-icons-fa:FaUser`

### Material Design (React Icons)
- **Prefix**: `react-icons-md`
- **Description**: Material Design icons
- **Example**: `react-icons-md:MdSearch`, `react-icons-md:MdFavorite`

### Ionicons (React Icons)
- **Prefix**: `react-icons-io`
- **Description**: Ionicons
- **Example**: `react-icons-io:IoHeart`, `react-icons-io:IoStar`

### Bootstrap Icons (React Icons)
- **Prefix**: `react-icons-bi`
- **Description**: Bootstrap icons
- **Example**: `react-icons-bi:BiUser`, `react-icons-bi:BiCog`

## Demo

Visit `/test-icon-picker` to see the Universal Icon Picker in action with a live demo.

## Integration Examples

### In Admin Panel

```tsx
// In your admin panel component
const IconField = ({ value, onChange }) => {
  return (
    <div className="form-group">
      <label>Icon</label>
      <UniversalIconPicker
        value={value}
        onChange={onChange}
        placeholder="Select an icon for this feature..."
        className="w-full"
      />
    </div>
  );
};
```

### In Form Builder

```tsx
// In your form builder
const IconSelector = ({ field, updateField }) => {
  return (
    <UniversalIconPicker
      value={field.icon}
      onChange={(iconName) => updateField(field.id, { icon: iconName })}
      placeholder="Choose an icon..."
      showPreview={true}
    />
  );
};
```

### Dynamic Icon Rendering

```tsx
// Render icons dynamically in your components
const FeatureCard = ({ feature }) => {
  return (
    <div className="feature-card">
      <div className="icon">
        {renderIcon(feature.icon, { className: 'w-8 h-8 text-blue-600' })}
      </div>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
    </div>
  );
};
```

## Styling

The Universal Icon Picker uses Tailwind CSS classes and can be customized with additional classes:

```tsx
<UniversalIconPicker
  className="w-full border-2 border-gray-300 rounded-lg shadow-sm"
  // ... other props
/>
```

## Performance Considerations

- Icons are loaded on-demand to minimize bundle size
- Search results are limited to prevent performance issues
- The component uses React.memo for optimal re-rendering
- Icon libraries are imported dynamically

## Troubleshooting

### Icon Not Found
If an icon doesn't appear, check:
1. The icon name is correct
2. The library prefix is correct
3. The icon exists in the specified library

### Build Errors
If you encounter build errors:
1. Ensure all dependencies are installed
2. Check that the icon libraries are properly imported
3. Verify TypeScript types are correct

### Performance Issues
For large icon sets:
1. Use search to limit results
2. Consider lazy loading for less common icons
3. Implement pagination if needed

## Contributing

To add support for additional icon libraries:

1. Install the new icon library
2. Add it to the `iconLibraries` object in `iconUtils.ts`
3. Update the library descriptions
4. Test the integration

## License

This component is part of the Saski AI Website project and follows the same licensing terms. 