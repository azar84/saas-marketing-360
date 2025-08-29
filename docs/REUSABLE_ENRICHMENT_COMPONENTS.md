# Reusable Search Result Enrichment Components

This document describes the reusable components for search result selection and enrichment submission that can be used across different parts of the application.

## Components Overview

### 1. SearchResultEnrichment
The main component that provides selection controls and enrichment submission functionality.

### 2. SearchResultCheckbox
Individual checkbox component for selecting specific search results.

## Usage Examples

### Basic Usage in SearchData Component

```tsx
import SearchResultEnrichment from '@/components/ui/SearchResultEnrichment';
import SearchResultCheckbox from '@/components/ui/SearchResultCheckbox';

const SearchData: React.FC = () => {
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());

  return (
    <div>
      {/* Enrichment Controls */}
      <SearchResultEnrichment
        searchResults={searchResults}
        selectedResults={selectedResults}
        onSelectionChange={setSelectedResults}
        onEnrichmentSubmitted={(count) => {
          console.log(`Enrichment jobs submitted: ${count}`);
        }}
        className="mb-6"
      />

      {/* Individual Result with Checkbox */}
      {searchResults.map((result) => (
        <div key={result.id}>
          <SearchResultCheckbox
            url={result.url}
            isSelected={selectedResults.has(result.url)}
            onToggle={(url) => {
              const newSelection = new Set(selectedResults);
              if (newSelection.has(url)) {
                newSelection.delete(url);
              } else {
                newSelection.add(url);
              }
              setSelectedResults(newSelection);
            }}
          />
          {/* Result content */}
        </div>
      ))}
    </div>
  );
};
```

### Usage in IndustrySearchManager Component

```tsx
import SearchResultEnrichment from '@/components/ui/SearchResultEnrichment';

const IndustrySearchManager: React.FC = () => {
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());

  return (
    <div>
      {/* Replace existing enrichment logic with reusable component */}
      <SearchResultEnrichment
        searchResults={searchResults}
        selectedResults={selectedResults}
        onSelectionChange={setSelectedResults}
        onEnrichmentSubmitted={(count) => {
          // Handle enrichment submission
          console.log(`Submitted ${count} jobs for enrichment`);
        }}
      />
    </div>
  );
};
```

## Component Props

### SearchResultEnrichment

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `searchResults` | `SearchResult[]` | Yes | - | Array of search results |
| `selectedResults` | `Set<string>` | No | Internal state | External selection state |
| `onSelectionChange` | `(selected: Set<string>) => void` | No | Internal handler | Callback for selection changes |
| `onEnrichmentSubmitted` | `(count: number) => void` | No | - | Callback when enrichment jobs are submitted |
| `className` | `string` | No | `''` | Additional CSS classes |
| `showSelectAll` | `boolean` | No | `true` | Show select all/deselect all buttons |
| `showEnrichmentButton` | `boolean` | No | `true` | Show the enrichment submission button |
| `showSelectionCount` | `boolean` | No | `true` | Show selection count display |

### SearchResultCheckbox

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `url` | `string` | Yes | - | URL of the search result |
| `isSelected` | `boolean` | Yes | - | Whether the result is selected |
| `onToggle` | `(url: string) => void` | Yes | - | Callback when checkbox is toggled |
| `label` | `string` | No | `'Select for enrichment'` | Label text for the checkbox |
| `className` | `string` | No | `''` | Additional CSS classes |

## Features

### Selection Management
- **Individual Selection**: Click checkboxes to select/deselect specific results
- **Bulk Selection**: Select All / Deselect All buttons
- **Selection Count**: Shows how many results are selected
- **Visual Feedback**: Clear indication of selected state

### Enrichment Submission
- **Job Creation**: Creates enrichment jobs for selected URLs
- **Progress Tracking**: Shows submission progress and status
- **Success Feedback**: Displays success count and clears selection
- **Error Handling**: Comprehensive error handling with notifications

### Customization
- **Flexible Display**: Show/hide different UI elements
- **External State**: Can work with parent component's state
- **Styling**: Customizable CSS classes
- **Callbacks**: Configurable event handlers

## Benefits

1. **Code Reuse**: No need to duplicate enrichment logic
2. **Consistent UI**: Same selection and submission experience across components
3. **Maintainability**: Single source of truth for enrichment functionality
4. **Flexibility**: Can be used with or without external state management
5. **Type Safety**: Full TypeScript support with proper interfaces

## Integration Steps

1. **Import Components**: Add imports to your component
2. **Add State**: Create `selectedResults` state if not already present
3. **Add Enrichment Component**: Place `SearchResultEnrichment` where you want the controls
4. **Add Checkboxes**: Add `SearchResultCheckbox` to each search result
5. **Connect State**: Pass selection state and change handlers to components
6. **Handle Callbacks**: Implement `onEnrichmentSubmitted` callback if needed

## Example Integration in Existing Components

### Before (Duplicated Code)
```tsx
// IndustrySearchManager.tsx - 100+ lines of enrichment logic
const submitEnrichmentJobsForUrls = async (websiteUrls: string[]) => { /* ... */ };
const handleEnrichmentSubmission = async () => { /* ... */ };
// ... more duplicated code

// SearchData.tsx - Similar logic duplicated
const submitEnrichmentJobsForUrls = async (websiteUrls: string[]) => { /* ... */ };
const handleEnrichmentSubmission = async () => { /* ... */ };
// ... more duplicated code
```

### After (Reusable Components)
```tsx
// IndustrySearchManager.tsx
<SearchResultEnrichment
  searchResults={searchResults}
  selectedResults={selectedResults}
  onSelectionChange={setSelectedResults}
/>

// SearchData.tsx
<SearchResultEnrichment
  searchResults={searchResults}
  selectedResults={selectedResults}
  onSelectionChange={setSelectedResults}
/>
```

This approach eliminates code duplication and provides a consistent user experience across the application.
