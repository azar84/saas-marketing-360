# SaaS CMS

A comprehensive content management system for SaaS businesses, built with Next.js, Prisma, and Tailwind CSS.

## Features

- **Admin Panel**: Complete content management interface
- **Dynamic Pages**: Server-side rendered pages with customizable sections
- **Feature Groups**: Manage and display feature groups with custom color controls
- **Hero Sections**: Customizable homepage hero with animations
- **Media Management**: Cloudinary integration for media handling
- **SEO Optimization**: Automatic sitemap generation and meta tags
- **Design System**: Consistent styling with CSS variables

## Recent Updates

### Feature Groups Color Controls
- Added comprehensive color controls for feature groups
- Customizable heading, subheading, card background, title, and subtitle colors
- Design system compliant with proper fallbacks
- Admin panel integration for easy color management
- **List Layout Fix**: Card background color now applies to inner content area for better visual effect

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npx prisma migrate dev`
5. Start development server: `npm run dev`

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: Prisma
- **Media**: Cloudinary
- **Deployment**: Vercel

## License

MIT
