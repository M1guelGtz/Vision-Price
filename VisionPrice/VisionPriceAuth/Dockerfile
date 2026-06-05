# syntax=docker/dockerfile:1.7

# ---------- builder ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# OpenSSL is required by Prisma at build time on slim images.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate --schema=src/infrastructure/database/prisma/schema.prisma
RUN npm run build

# Prune dev dependencies for the production image
RUN npm prune --omit=dev

# ---------- production ----------
FROM node:20-bookworm-slim AS production
ENV NODE_ENV=production
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Non-root user
RUN groupadd -r nodeapp && useradd -r -g nodeapp -m -d /home/nodeapp nodeapp

COPY --from=builder --chown=nodeapp:nodeapp /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodeapp /app/dist ./dist
COPY --from=builder --chown=nodeapp:nodeapp /app/package.json ./package.json
COPY --from=builder --chown=nodeapp:nodeapp /app/src/infrastructure/database/prisma ./src/infrastructure/database/prisma

USER nodeapp
EXPOSE 3000

CMD ["node", "dist/main.js"]
