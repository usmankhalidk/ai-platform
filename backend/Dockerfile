# Stage 1: compile TypeScript to JavaScript
FROM node:20-alpine AS builder
WORKDIR /app

# Install all dependencies (including devDependencies needed for tsc)
COPY package*.json ./
RUN npm ci

# Copy tsconfig and source, then compile
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Stage 2: lean production image — no devDependencies, no source files
FROM node:20-alpine
WORKDIR /app

# Only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Pull compiled output from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
