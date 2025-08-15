# SaaS Marketing 360

A comprehensive SaaS marketing platform built with Next.js, React, TypeScript, and Tailwind CSS. This platform provides a complete solution for SaaS businesses to manage their marketing operations, customer relationships, and business growth.

## 🚀 Features

### Core Marketing Features
- **Dashboard** - Marketing analytics and performance overview
- **Media Library** - Asset management for marketing materials
- **Pricing Plans** - Configure and manage pricing tiers
- **FAQ Management** - Create and manage FAQ content
- **Forms Management** - Lead capture and contact forms
- **Newsletter Subscribers** - Email marketing and list management
- **Script Installation** - Marketing tracking and analytics
- **User Management** - Team and customer management
- **Scheduler** - Marketing campaign automation
- **Design System** - Brand consistency and styling
- **Site Settings** - Platform configuration

### Marketing-Specific Capabilities
- **Lead Management** - Capture and nurture leads
- **Campaign Tracking** - Monitor marketing campaign performance
- **Customer Segmentation** - Organize and target customers
- **Content Management** - Manage marketing content and assets
- **Analytics Integration** - Track marketing metrics
- **Automation Tools** - Marketing workflow automation

### Technical Features
- **Authentication** - JWT-based login system
- **Dynamic Design System** - Customizable colors and themes
- **Responsive Design** - Mobile-first approach
- **TypeScript** - Full type safety
- **Prisma ORM** - Database management
- **Tailwind CSS** - Utility-first styling
- **Next.js 15** - Latest React framework

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/azar84/saas-marketing-360.git
   cd saas-marketing-360
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/saas_marketing"
   JWT_SECRET="your-secret-key"
   # External API protection token (required for keyword generation)
   VERCEL_AUTOMATION_BYPASS_SECRET=""
   # Marketing MCP base URL (default points to beta)
   MARKETING_MCP_API_URL="https://marketing-mcp-beta.vercel.app"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the admin panel**
   - URL: `http://localhost:3000/admin-panel`
   - Default credentials: `admin` / `admin123`

## 🏗️ Project Structure

```
saas-marketing-360/
├── src/
│   ├── app/
│   │   ├── admin-panel/          # Admin panel pages
│   │   │   ├── components/       # Admin components
│   │   │   ├── login/           # Login page
│   │   │   └── page.tsx         # Main admin dashboard
│   │   └── api/                 # API routes
│   │       └── admin/           # Admin API endpoints
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   └── form-builder/        # Form building components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility functions
│   └── types/                   # TypeScript type definitions
├── prisma/                      # Database schema and migrations
├── public/                      # Static assets
└── scripts/                     # Utility scripts
```

## 🔧 Configuration

### Design System
The platform uses a dynamic design system that can be customized through the Design System manager:

- **Primary Colors** - Main brand colors
- **Secondary Colors** - Supporting colors
- **Text Colors** - Typography colors
- **Background Colors** - Layout backgrounds
- **Sidebar Configuration** - Navigation styling

### Database Schema
The project uses Prisma with PostgreSQL. Key models include:

- **AdminUser** - Admin authentication
- **SiteSettings** - Global configuration
- **DesignSystem** - Color and theme settings
- **PricingPlans** - Pricing configuration
- **FAQ** - FAQ content management

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the project: `npm run build`
2. Start production server: `npm start`

## 📝 Usage

### Adding New Marketing Features
1. Create components in `src/app/admin-panel/components/`
2. Add API routes in `src/app/api/admin/`
3. Update navigation in `src/app/admin-panel/page.tsx`
4. Add types in `src/types/index.ts`

### Customization
- **Colors**: Use the Design System manager
- **Layout**: Modify `src/app/admin-panel/page.tsx`
- **Authentication**: Update `src/hooks/useAuth.ts`
- **Database**: Modify `prisma/schema.prisma`

## 🎯 Marketing Use Cases

### Lead Generation
- Capture leads through contact forms
- Manage lead lists and segmentation
- Track lead sources and conversion rates

### Content Marketing
- Manage marketing content and assets
- Organize media library for campaigns
- Create and manage FAQ content

### Customer Management
- Manage customer subscriptions
- Track customer interactions
- Handle customer support requests

### Campaign Management
- Schedule marketing campaigns
- Track campaign performance
- Automate marketing workflows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs/`
- Review the cleanup summary in `ADMIN_PANEL_CLEANUP_SUMMARY.md`

## 🔄 Recent Changes

This platform was created by adapting a comprehensive CMS system into a focused SaaS marketing solution. See `ADMIN_PANEL_CLEANUP_SUMMARY.md` for detailed information about the evolution.

---

**Built with ❤️ using Next.js, React, and TypeScript**
