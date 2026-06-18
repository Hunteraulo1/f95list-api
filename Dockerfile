FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
ENV NODE_ENV=production
RUN bun run build

FROM oven/bun:1-alpine AS runner
WORKDIR /app

RUN apk add --no-cache bash mariadb-client

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY package.json bun.lock ./

RUN bun install --production --frozen-lockfile

COPY --from=builder --chown=bun:bun /app/dist ./dist
COPY --chown=bun:bun scripts/coolify-start.sh ./scripts/coolify-start.sh

RUN chmod +x scripts/coolify-start.sh && chown -R bun:bun /app

EXPOSE 3000
USER bun
CMD ["bash", "scripts/coolify-start.sh"]
