# Stage 1: install deps and build the Next.js app
FROM node:20-alpine AS builder
WORKDIR /app

# Copy manifests first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy all source files, then build
# NEXT_PUBLIC_ vars must be available at build time so Next.js can inline them
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY . .
RUN npm run build

# Stage 2: lean production image using Next.js standalone output
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# next build --standalone copies only the files needed to run the server
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# messages/ is needed at runtime for next-intl dynamic imports
COPY --from=builder /app/messages ./messages
# Note: no public/ directory in this project — omitted intentionally

EXPOSE 3000

CMD ["node", "server.js"]
