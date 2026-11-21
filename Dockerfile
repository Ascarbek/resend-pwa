# syntax=docker/dockerfile:1

# ---- build the PWA --------------------------------------------------------
FROM oven/bun:1.4 AS build
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/
COPY apps/server/package.json apps/server/
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# ---- runtime: Bun server serving webhooks, API and the static PWA ----------
FROM oven/bun:1.4-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    STATIC_DIR=/app/public \
    DATA_FILE=/app/data/data.json
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/
COPY apps/server/package.json apps/server/
RUN bun install --frozen-lockfile --production --filter server
COPY apps/server/src apps/server/src
COPY --from=build /app/apps/web/build /app/public
RUN mkdir -p /app/data && chown bun:bun /app/data
VOLUME /app/data
WORKDIR /app/apps/server
EXPOSE 3000
USER bun
CMD ["bun", "src/index.ts"]
