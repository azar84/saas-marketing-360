# JSON-LD Structured Data System

This document explains the comprehensive JSON-LD (JavaScript Object Notation for Linked Data) structured data system implemented in your Saski AI website.

## 🎯 What is JSON-LD?

JSON-LD is Google's preferred method for adding structured data to web pages. It helps search engines better understand your content, which can lead to:

- **Rich snippets** in search results
- **Enhanced search appearance** with additional information
- **Better search engine comprehension** of your content
- **Improved SEO rankings**
- **Voice search optimization**

## 🚀 Features Implemented

### 1. **Organization Schema**
- Company information (name, description, contact details)
- Social media profiles
- Contact points (phone, email)
- Business address
- Logo and branding

### 2. **WebSite Schema**
- Site information and search functionality
- Publisher information
- Site-wide metadata

### 3. **WebPage Schema**
- Individual page metadata
- Publication and modification dates
- Page hierarchy and relationships

### 4. **FAQ Schema**
- Structured FAQ data for better search visibility
- Question and answer pairs
- FAQ category organization

### 5. **Breadcrumb Schema**
- Navigation structure
- Page hierarchy for better user experience

### 6. **Article Schema**
- Blog posts and articles
- Author and publisher information
- Publication metadata

## 📁 File Structure

```
src/lib/
├── jsonld.ts          # Core JSON-LD generation utilities
└── metadata.ts        # Enhanced metadata functions with JSON-LD

src/app/api/admin/seo/audit/
└── route.ts          # SEO audit with JSON-LD validation
```

## 🔧 How to Use

### For Regular Pages

```typescript
import { generatePageMetadataWithJsonLd } from '@/lib/metadata';

// In your page component
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const result = await generatePageMetadataWithJsonLd(params.slug);
  return result.metadata;
}

// To include JSON-LD in your page
export default async function Page({ params }: { params: { slug: string } }) {
  const result = await generatePageMetadataWithJsonLd(params.slug);
  
  return (
    <>
      {result.jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: result.jsonLd }}
        />
      )}
      {/* Your page content */}
    </>
  );
}
```

### For FAQ Pages

```typescript
import { generateFAQCategoryMetadataWithJsonLd } from '@/lib/metadata';

// FAQ Category page
export async function generateMetadata({ params }: { params: { category: string } }) {
  const result = await generateFAQCategoryMetadataWithJsonLd(params.category);
  return result.metadata;
}

export default async function FAQCategoryPage({ params }: { params: { category: string } }) {
  const result = await generateFAQCategoryMetadataWithJsonLd(params.category);
  
  return (
    <>
      {result.jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: result.jsonLd }}
        />
      )}
      {/* FAQ content */}
    </>
  );
}
```

### Manual JSON-LD Generation

```typescript
import { 
  generateOrganizationJsonLd, 
  generateWebSiteJsonLd, 
  combineJsonLd 
} from '@/lib/jsonld';

// Create custom JSON-LD
const siteSettings = {
  baseUrl: 'https://saskiai.com',
  siteName: 'Saski AI',
  siteDescription: 'Transform Your Customer Communication with AI',
  // ... other settings
};

const organizationJsonLd = generateOrganizationJsonLd(siteSettings);
const websiteJsonLd = generateWebSiteJsonLd(siteSettings);
const combinedJsonLd = combineJsonLd(organizationJsonLd, websiteJsonLd);
```

## 🏗️ Automatic Implementation

### Current Implementation

The system automatically generates appropriate JSON-LD for:

1. **Home Page**: Organization + WebSite + WebPage schemas
2. **Regular Pages**: Organization + WebPage schemas  
3. **FAQ Categories**: Organization + WebPage + FAQ schemas + Breadcrumbs
4. **FAQ Questions**: Organization + WebPage + FAQ schemas + Breadcrumbs

### SEO Audit Integration

The SEO Manager automatically checks for JSON-LD presence and validity:

```typescript
// In SEO audit results
metaTagsStatus: {
  title: true,
  description: true,
  canonical: true,
  robots: true,
  ogTitle: true,
  twitterCard: true,
  jsonLd: true  // ✅ Now included in audit
}
```

## 📊 Benefits You'll See

### 1. **Rich Search Results**
- FAQ pages may appear with expandable Q&A in search results
- Organization info can appear in knowledge panels
- Breadcrumb navigation in search results

### 2. **Better SEO**
- Improved search engine understanding of content
- Higher likelihood of featured snippets
- Better categorization of your content

### 3. **Voice Search Optimization**
- FAQ schemas help with voice search queries
- Clear content structure for voice assistants

### 4. **Social Media Integration**
- Better social media previews
- Enhanced sharing capabilities

## 🔍 Testing Your JSON-LD

### 1. **Google's Rich Results Test**
Visit: https://search.google.com/test/rich-results
Enter your page URL to validate JSON-LD

### 2. **Schema.org Validator**
Visit: https://validator.schema.org/
Paste your JSON-LD to validate structure

### 3. **SEO Manager Audit**
- Go to Admin Panel → SEO Manager → SEO Audit tab
- Enable "Check live pages for meta tags"
- Run audit to see JSON-LD validation

## 🛠️ Customization

### Adding New Schema Types

1. **Define the interface** in `src/lib/jsonld.ts`:
```typescript
interface Product {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  // ... other properties
}
```

2. **Create generation function**:
```typescript
export function generateProductJsonLd(product: ProductData): Product {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    // ... other properties
  };
}
```

3. **Update the main function**:
```typescript
// Add to getPageJsonLd function
case 'product':
  jsonLdObjects.push(generateProductJsonLd(pageData));
  break;
```

### Modifying Existing Schemas

Edit the generation functions in `src/lib/jsonld.ts` to add or modify properties according to your needs.

## 📈 Monitoring & Analytics

### In Google Search Console
- Monitor **Rich Results** reports
- Check for **Structured Data** errors
- Track **Search Appearance** improvements

### In SEO Manager
- Regular audits show JSON-LD status
- Track pages with missing or invalid JSON-LD
- Monitor SEO scores (JSON-LD contributes to scoring)

## 🚨 Important Notes

1. **Valid JSON**: Always ensure JSON-LD is valid JSON
2. **Schema.org Compliance**: Follow schema.org guidelines
3. **No Duplication**: Don't duplicate information between meta tags and JSON-LD
4. **Keep Updated**: Update JSON-LD when page content changes

## 🔗 Useful Resources

- [Schema.org Documentation](https://schema.org/)
- [Google's Structured Data Guidelines](https://developers.google.com/search/docs/guides/intro-structured-data)
- [JSON-LD Specification](https://json-ld.org/)
- [Google's Rich Results Test](https://search.google.com/test/rich-results)

## 💡 Pro Tips

1. **Start Simple**: Begin with basic Organization and WebPage schemas
2. **Test Regularly**: Use Google's tools to validate your JSON-LD
3. **Monitor Performance**: Track search result improvements
4. **Keep It Relevant**: Only include JSON-LD that's relevant to the page content
5. **Update Site Settings**: Ensure your site settings are complete for best JSON-LD output

Your JSON-LD system is now fully integrated and will help improve your search engine visibility and user experience! 🎉 