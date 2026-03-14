# Stage 1: compile TypeScript to JavaScript
FROM node:20-alpine AS builder
WORKDIR /app

# Install all dependencies (including devDependencies needed for tsc)
# Using npm install instead of npm ci — no package-lock.json in Docker build context
# (workspace lock file lives at the monorepo root, outside this service's build context)
COPY package*.json ./
RUN npm install

# Copy tsconfig and source, then compile
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Stage 2: lean production image — no devDependencies, no source files
FROM node:20-alpine
WORKDIR /app

# Only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Pull compiled output from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
