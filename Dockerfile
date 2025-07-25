# Use PostgreSQL 15 Alpine as base image
FROM postgres:15-alpine AS base

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy the Prisma schema and seed script
COPY --from=builder /app/prisma ./prisma

# Copy the entrypoint script
COPY --from=builder /app/init-app.sh ./init-app.sh
RUN chmod +x ./init-app.sh

# Install Prisma CLI and bcryptjs
RUN npm install -g prisma
RUN npm install bcryptjs

# Copy PostgreSQL configuration
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Expose ports
EXPOSE 3000 5432

# Set environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV POSTGRES_DB saas_cms
ENV POSTGRES_USER saas_cms_user
ENV POSTGRES_PASSWORD saas_cms_password
ENV DATABASE_URL postgresql://saas_cms_user:saas_cms_password@localhost:5432/saas_cms

# Use the init script
CMD ["./init-app.sh"] 