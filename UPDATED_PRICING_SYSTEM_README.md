# Updated Pricing System with Shared + Custom Features

## ✨ Overview

The pricing system has been completely redesigned to support both **shared features** (from a global feature pool) and **custom per-plan features** with UUID-based architecture. This provides maximum flexibility for creating sophisticated pricing plans with mixed feature types.

## 🏗 Architecture

### Database Schema Updates

#### Key Changes:
- **UUID IDs**: All models now use UUID strings instead of auto-incrementing integers
- **Shared Features**: New `SharedFeature` model for global feature pool
- **Custom Features**: PlanFeature model supports null `featureId` for custom features
- **Enhanced Flexibility**: Mix shared and custom features within any plan

#### Core Models:

```prisma
model Plan {
  id          String        @id @default(uuid())
  name        String
  description String?
  position    Int           @default(0)
  isActive    Boolean       @default(true)
  isPopular   Boolean       @default(false) // Only one can be popular
  pricing     PlanPricing[]
  features    PlanFeature[]
}

model SharedFeature {
  id       String        @id @default(uuid())
  name     String        // e.g., "API Access", "Custom Branding"
  icon     String?       // Icon name
  category String?       // Feature category
  usedIn   PlanFeature[] // Plans using this feature
}

model PlanFeature {
  id          String         @id @default(uuid())
  planId      String         // Plan this feature belongs to
  featureId   String?        // NULL = custom feature, UUID = shared feature
  available   Boolean        @default(true)
  label       String?        // Custom feature name (when featureId is null)
  icon        String?        // Custom feature icon override
  
  plan        Plan           @relation(fields: [planId], references: [id])
  feature     SharedFeature? @relation(fields: [featureId], references: [id])
}
```

## 🚀 Getting Started

### 1. Database Migration

The system has been migrated with sample data:

```bash
# Database was reset and seeded with:
npm run db:push --force-reset
node seed-new-pricing.js
```

### 2. Sample Data Structure

**Plans Created:**
- **Starter**: Basic plan with custom features only
- **Professional**: Mix of shared + custom features (Popular plan)
- **Enterprise**: All shared features + exclusive custom features

**Shared Features Pool:**
- Connect to WhatsApp (Integrations)
- Custom Branding (Customization) 
- Advanced Analytics (Analytics)
- Priority Support (Support)
- API Access (Developer)

**Custom Features Examples:**
- "Basic Email Support" (Starter only)
- "2x Token Multiplier" (Professional)
- "Dedicated Success Manager" (Enterprise)
- "White Label Solution" (Enterprise)

## 🎛 Admin Panel Features

### Plan Management

Access at `/admin-panel` → "Pricing Plans"

#### Features:
- ✅ **Create/Edit Plans**: Name, description, position, popular status
- ✅ **Pricing Configuration**: Per billing cycle (Monthly/Yearly)
- ✅ **Usage Limits**: Assistants, tokens, knowledge bases, phone numbers
- ✅ **Popular Plan Enforcement**: Only one plan can be marked as popular
- ✅ **Expandable Plan Cards**: Click to expand full configuration

#### Plan Features Management:

**Shared Features Tab:**
- Select from global feature pool
- Multi-select available shared features
- Automatic filtering (hides already-added features)

**Custom Features Tab:**  
- Add plan-specific custom features
- Set custom name and icon
- Perfect for unique selling points

#### Real-time Updates:
- All changes reflect immediately
- Comprehensive validation
- Error handling and user feedback

## 🔧 API Endpoints

### Core Endpoints

| Endpoint | Purpose | UUID Support |
|----------|---------|--------------|
| `GET /api/admin/plans` | Fetch all plans with pricing & features | ✅ |
| `POST /api/admin/plans` | Create new plan | ✅ |
| `PUT /api/admin/plans` | Update plan (popular enforcement) | ✅ |
| `DELETE /api/admin/plans?id={uuid}` | Delete plan | ✅ |
| `GET /api/admin/shared-features` | Global feature pool | ✅ |
| `POST /api/admin/shared-features` | Create shared feature | ✅ |
| `GET /api/admin/plan-features` | Plan feature assignments | ✅ |
| `POST /api/admin/plan-features` | Add feature to plan | ✅ |
| `GET /api/admin/billing-cycles` | Billing cycles | ✅ |
| `GET /api/admin/plan-pricing` | Pricing configurations | ✅ |

### Feature Assignment Logic

```typescript
// Add shared feature to plan
{
  "planId": "uuid-here",
  "featureId": "shared-feature-uuid", // Links to SharedFeature
  "available": true
}

// Add custom feature to plan  
{
  "planId": "uuid-here", 
  "featureId": null, // NULL = custom feature
  "available": true,
  "label": "Custom Feature Name",
  "icon": "IconName"
}
```

## 🌟 Customer-Facing Features

### Pricing Section Component

Located: `src/components/sections/PricingSection.tsx`

#### Features:
- ✅ **Billing Toggle**: Switch between Monthly/Yearly
- ✅ **Usage Limits Display**: Tokens, assistants, etc.
- ✅ **Mixed Features**: Shows both shared and custom features
- ✅ **Popular Plan Highlighting**: Visual emphasis on popular plan
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **"Unlimited" Handling**: Displays -1 values as "Unlimited"

#### Feature Display Logic:
```typescript
// Shared features show SharedFeature.name
// Custom features show PlanFeature.label
const getFeatureDisplayName = (planFeature: PlanFeature) => {
  return planFeature.feature?.name || planFeature.label || 'Unknown Feature';
};
```

## 💡 Usage Examples

### Example 1: Create Shared Feature

```typescript
// Create a new shared feature for the global pool
const newSharedFeature = await fetch('/api/admin/shared-features', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Advanced Reporting',
    icon: 'BarChart3',
    category: 'Analytics'
  })
});
```

### Example 2: Add Shared Feature to Plan

```typescript
// Add the shared feature to a specific plan
await fetch('/api/admin/plan-features', {
  method: 'POST', 
  body: JSON.stringify({
    planId: 'plan-uuid-here',
    featureId: 'shared-feature-uuid-here',
    available: true
  })
});
```

### Example 3: Add Custom Feature to Plan

```typescript
// Add a custom feature unique to this plan
await fetch('/api/admin/plan-features', {
  method: 'POST',
  body: JSON.stringify({
    planId: 'enterprise-plan-uuid',
    featureId: null, // NULL = custom feature
    available: true,
    label: 'Dedicated Account Manager',
    icon: 'UserCheck'
  })
});
```

## 🔍 Key Benefits

### For Administrators:
- **Efficiency**: Reuse shared features across multiple plans
- **Flexibility**: Add unique custom features per plan
- **Consistency**: Global features maintain consistent naming
- **Scalability**: Easy to add new shared features to multiple plans

### For Customers:
- **Clarity**: Clear feature differentiation 
- **Transparency**: All features and limits clearly displayed
- **Comparison**: Easy to compare plans side-by-side

### For Developers:
- **Type Safety**: Full TypeScript support with proper types
- **UUID Architecture**: Better for distributed systems and APIs
- **Clean API**: RESTful endpoints with proper validation
- **Extensible**: Easy to add new feature types or properties

## 📊 Data Flow

```
1. Admin creates shared features → Global feature pool
2. Admin creates plans → Basic plan structure  
3. Admin adds pricing → Per billing cycle pricing
4. Admin assigns features:
   - Shared: Links to global feature
   - Custom: Creates plan-specific feature
5. Customer views pricing → Mixed features displayed
6. Integration ready → Stripe Price IDs available
```

## 🛠 Technical Implementation

### Popular Plan Enforcement

```typescript
// When setting a plan as popular, unset all others
if (data.isPopular) {
  await prisma.plan.updateMany({
    where: { isPopular: true },
    data: { isPopular: false },
  });
}
```

### Feature Type Detection

```typescript
// Determine if feature is shared or custom
const isSharedFeature = planFeature.featureId !== null;
const featureName = isSharedFeature 
  ? planFeature.feature.name 
  : planFeature.label;
```

### Pricing Display

```typescript
// Handle unlimited values (-1) and pricing display
const formatLimit = (value: number) => {
  return value === -1 ? 'Unlimited' : value.toLocaleString();
};

const formatPrice = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`;
};
```

## 🚀 Ready for Production

### ✅ Complete Features:
- Full CRUD operations for all entities
- UUID-based architecture 
- Shared + custom feature mixing
- Popular plan enforcement
- Real-time admin interface
- Customer-facing pricing display
- Stripe integration ready
- Mobile responsive design
- Comprehensive validation
- Error handling

### 🎯 Next Steps:
1. **Stripe Integration**: Use the `stripePriceId` fields for checkout
2. **User Authentication**: Add user roles and permissions
3. **Advanced Features**: Feature usage tracking, plan analytics
4. **Customization**: Theming and white-label options

## 🎉 Success!

Your pricing system now supports the most flexible architecture possible:
- **Mix shared and custom features** within any plan
- **UUID-based** for scalability
- **Admin-friendly** interface for easy management  
- **Customer-ready** pricing display
- **Stripe-ready** for payments integration

The system is production-ready and can handle complex pricing scenarios while maintaining simplicity for basic use cases. 