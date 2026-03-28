# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Constrain V8 heap for resource-limited Docker VMs (Colima, Docker Desktop).
# Default 1024 MB is safe for 4 GB VMs; override via --build-arg NODE_HEAP_MB=2048.
ARG NODE_HEAP_MB=1024
ENV NODE_OPTIONS="--max-old-space-size=${NODE_HEAP_MB}"
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js inlines NEXT_PUBLIC_* at build time — export them from .env.local.
# Exit-code wrapper distinguishes OOM kills (137) from source/config errors.
RUN set -a \
    && eval "$(grep -v '^\s*#' .env.local | sed '/^\s*$/d')" \
    && npm run build \
    && npm run build:worker \
    ; rc=$? \
    ; if [ $rc -ne 0 ]; then \
        echo "" ; \
        if [ $rc -eq 137 ] || [ $rc -eq 9 ]; then \
          echo "================================================================" ; \
          echo "BUILD KILLED (exit $rc) — out of memory" ; \
          echo "The Next.js build worker was SIGKILL'd by the kernel OOM killer." ; \
          echo "This is an environment/resource issue, NOT a source-code error." ; \
          echo "" ; \
          echo "Fixes:" ; \
          echo "  colima : colima stop && colima start --memory 6" ; \
          echo "  Desktop: Settings > Resources > increase Memory" ; \
          echo "  Or:      docker compose build --build-arg NODE_HEAP_MB=768" ; \
          echo "================================================================" ; \
        else \
          echo "================================================================" ; \
          echo "BUILD FAILED (exit $rc) — review TypeScript / webpack errors above" ; \
          echo "================================================================" ; \
        fi ; \
        exit $rc ; \
      fi

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone server output
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/.worker-dist ./.worker-dist

USER nextjs

ARG PORT=3010
ENV PORT=$PORT
EXPOSE $PORT

CMD ["node", "server.js"]
