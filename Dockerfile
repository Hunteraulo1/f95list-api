FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lock tsconfig.json tsconfig.build.json ./
RUN bun install --frozen-lockfile

COPY src ./src
RUN bun run build
RUN bun install --production --frozen-lockfile

FROM oven/bun:1-alpine AS runner
WORKDIR /app

RUN apk add --no-cache bash mariadb-client

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder --chown=bun:bun /app/node_modules ./node_modules
COPY --from=builder --chown=bun:bun /app/dist ./dist
COPY --from=builder --chown=bun:bun /app/package.json ./package.json
COPY --chown=bun:bun scripts/coolify-start.sh ./scripts/coolify-start.sh

RUN chmod +x scripts/coolify-start.sh && chown -R bun:bun /app

EXPOSE 3000
USER bun
CMD ["bash", "scripts/coolify-start.sh"]
