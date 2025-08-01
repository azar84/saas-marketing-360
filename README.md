# SaaS CMS

A modern SaaS CMS built with Next.js, TypeScript, and PostgreSQL.

## Version 1.10

This version includes:
- ✅ Removed Vercel cron job to avoid plan limits
- ✅ Added safe database migration system
- ✅ Built-in scheduler for sitemap submission
- ✅ Deployment verification scripts
- ✅ Fixed dashboard statistics to show real data

## Features

- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **File Upload**: Cloudinary integration
- **SEO**: Automatic sitemap generation and submission
- **Admin Panel**: Full-featured content management system
- **Page Builder**: Drag-and-drop page building
- **Design System**: Customizable colors, fonts, and components
- **Responsive**: Mobile-first design
- **Performance**: Optimized for speed and SEO

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npm run db:migrate`
5. Start development server: `npm run dev`

## Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes
- `npm run db:seed` - Seed database with sample data

## Deployment

The application is configured for deployment on Vercel with:
- Automatic database migrations
- Built-in scheduler for background tasks
- Safe deployment verification

## License

MIT
