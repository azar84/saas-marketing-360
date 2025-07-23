# Form Builder System

A comprehensive form builder system for creating dynamic, customizable forms with predefined field types, validation, and submission management.

## 🚀 Features

### **Predefined Field Types**
- **Text Input** - Single line text input
- **Email** - Email address with validation
- **Phone Number** - Phone number input with validation
- **Text Area** - Multi-line text input
- **Select Dropdown** - Dropdown with custom options
- **Checkbox** - Single checkbox input
- **Radio Buttons** - Radio button group with options
- **Date Picker** - Date selection input
- **Number Input** - Numeric input field
- **Website URL** - URL input with validation
- **First Name** - First name input (half width)
- **Last Name** - Last name input (half width)
- **Company** - Company name input
- **Address** - Address input field

### **Form Management**
- Create forms with custom titles and subheadings
- Configure success and error messages
- Add/remove/reorder form fields
- Set field validation rules
- Configure field widths (full, half, third, quarter)
- Enable/disable forms

### **Field Configuration**
- Custom labels and placeholders
- Help text for fields
- Required field validation
- Field width configuration
- Options for select/radio fields
- Field-specific validation rules

### **Submission Management**
- View all form submissions
- Filter submissions by form
- Mark submissions as read/unread
- Mark submissions as spam
- Add notes to submissions
- Delete submissions
- Export submission data

### **Frontend Integration**
- Responsive form rendering
- Client-side validation
- Success/error message handling
- Loading states
- Form submission tracking

## 📁 File Structure

```
src/
├── app/
│   ├── admin-panel/
│   │   └── components/
│   │       ├── FormBuilder.tsx              # Main form builder interface
│   │       ├── FormSubmissionsManager.tsx   # Submission management
│   │       └── ContactManager.tsx           # Updated with form builder tabs
│   └── api/
│       ├── admin/
│       │   ├── forms/
│       │   │   └── route.ts                 # Form CRUD operations
│       │   └── form-submissions/
│       │       └── route.ts                 # Submission management
│       └── contact/
│           └── submit/
│               └── route.ts                 # Form submission handling
├── components/
│   ├── form-builder/
│   │   └── FormFieldTypes.tsx               # Predefined field types
│   └── sections/
│       └── FormSection.tsx                  # Frontend form renderer
└── lib/
    └── db.ts                                # Database connection
```

## 🗄️ Database Schema

### **Form Model**
```prisma
model Form {
  id              Int      @id @default(autoincrement())
  name            String   // Internal name
  title           String   // Display title
  subheading      String?  // Display subheading
  successMessage  String   // Success message
  errorMessage    String   // Error message
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  fields          FormField[]
  submissions     FormSubmission[]
  pageSections    PageSection[]
}
```

### **FormField Model**
```prisma
model FormField {
  id              Int      @id @default(autoincrement())
  formId          Int
  fieldType       String   // Predefined field type
  fieldName       String   // Internal field name
  label           String   // Display label
  placeholder     String?  // Placeholder text
  helpText        String?  // Help text
  isRequired      Boolean  @default(false)
  isVisible       Boolean  @default(true)
  sortOrder       Int      @default(0)
  fieldOptions    String?  // JSON configuration
  fieldWidth      String   @default("full")
  
  form            Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
}
```

### **FormSubmission Model**
```prisma
model FormSubmission {
  id              Int      @id @default(autoincrement())
  formId          Int
  formData        String   // JSON submission data
  ipAddress       String?
  userAgent       String?
  referrer        String?
  isRead          Boolean  @default(false)
  isSpam          Boolean  @default(false)
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  form            Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
}
```

## 🛠️ Usage

### **Creating a Form**

1. Navigate to **Admin Panel > Forms Management > Form Builder**
2. Click **"Create New Form"**
3. Fill in form details:
   - **Internal Name**: Used for identification
   - **Display Title**: Shown to users
   - **Subheading**: Optional subtitle
   - **Success Message**: Shown after successful submission
   - **Error Message**: Shown if submission fails

### **Adding Fields**

1. Click on any predefined field type card
2. Configure the field:
   - **Field Label**: Display name
   - **Field Name**: Internal identifier
   - **Placeholder**: Hint text
   - **Help Text**: Additional guidance
   - **Required**: Make field mandatory
3. Click **"Add Field"**

### **Field Types**

#### **Text Input**
- Single line text input
- Supports validation
- Configurable width

#### **Email**
- Email address input
- Automatic email validation
- Full width by default

#### **Phone Number**
- Phone number input
- Automatic phone validation
- Full width by default

#### **Text Area**
- Multi-line text input
- Resizable
- Full width by default

#### **Select Dropdown**
- Dropdown with options
- Add options in field configuration
- Full width by default

#### **Checkbox**
- Single checkbox
- No validation required
- Full width by default

#### **Radio Buttons**
- Radio button group
- Add options in field configuration
- Full width by default

#### **Date Picker**
- Date selection input
- Browser-native date picker
- Full width by default

#### **Number Input**
- Numeric input
- Automatic number validation
- Full width by default

#### **Website URL**
- URL input
- Automatic URL validation
- Full width by default

#### **First Name / Last Name**
- Name inputs
- Half width by default
- Perfect for side-by-side layout

#### **Company**
- Company name input
- Full width by default
- Optional field

#### **Address**
- Address input
- Full width by default
- Optional field

### **Managing Submissions**

1. Navigate to **Admin Panel > Forms Management > Submissions**
2. View all form submissions
3. Filter by specific forms
4. Mark submissions as read/unread
5. Mark submissions as spam
6. Add notes to submissions
7. Delete submissions

### **Frontend Integration**

Use the `FormSection` component to render forms:

```tsx
import FormSection from '@/components/sections/FormSection';

// In your page component
<FormSection 
  formId={1} 
  title="Custom Title" 
  subtitle="Custom Subtitle" 
/>
```

## 🔧 API Endpoints

### **Forms Management**
- `GET /api/admin/forms` - Get all forms
- `POST /api/admin/forms` - Create new form
- `PUT /api/admin/forms` - Update existing form
- `DELETE /api/admin/forms?id={id}` - Delete form

### **Form Submissions**
- `GET /api/admin/form-submissions` - Get submissions with pagination
- `PUT /api/admin/form-submissions` - Update submission status
- `DELETE /api/admin/form-submissions?id={id}` - Delete submission

### **Form Submission**
- `POST /api/contact/submit` - Submit form data

## 🎨 Styling

The form builder uses the existing design system:
- **Colors**: Green theme with proper contrast
- **Typography**: Consistent with site design
- **Spacing**: Tailwind CSS spacing system
- **Responsive**: Mobile-first design
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🔒 Validation

### **Client-Side Validation**
- Required field validation
- Email format validation
- Phone number format validation
- URL format validation
- Real-time error feedback

### **Server-Side Validation**
- Required field validation
- Data type validation
- Form existence validation
- Form active status validation

## 📊 Features in Detail

### **Field Width Options**
- **Full**: Takes full width of container
- **Half**: Takes 50% width (side-by-side layout)
- **Third**: Takes 33.33% width
- **Quarter**: Takes 25% width

### **Field Options**
- **Select/Radio**: JSON array of options
- **Validation**: Field-specific validation rules
- **Styling**: Width and appearance settings

### **Submission Tracking**
- **IP Address**: Track submitter's IP
- **User Agent**: Browser information
- **Referrer**: Source page
- **Timestamp**: Submission date/time
- **Status**: Read/unread, spam flags

## 🚀 Getting Started

1. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Seed Sample Data**
   ```bash
   node seed-forms.js
   ```

3. **Access Admin Panel**
   - Navigate to `/admin-panel`
   - Go to **Forms Management**
   - Start building forms!

## 🔮 Future Enhancements

- **Drag & Drop Interface**: Visual form builder
- **Form Templates**: Pre-built form templates
- **Email Integration**: Auto-responder emails
- **File Upload**: File attachment fields
- **Conditional Logic**: Show/hide fields based on conditions
- **Multi-step Forms**: Wizard-style forms
- **Form Analytics**: Submission statistics
- **Export Options**: CSV, Excel export
- **API Integration**: Webhook notifications
- **Spam Protection**: CAPTCHA, honeypot fields

## 📝 Notes

- Forms are automatically responsive
- All field types support theme colors
- Submissions are stored as JSON for flexibility
- Form builder is fully integrated with the page builder
- Supports both contact forms and custom forms
- Built with TypeScript for type safety
- Uses Prisma for database operations
- Follows existing code patterns and conventions 