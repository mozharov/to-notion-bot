FROM oven/bun:1.3.14-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./

FROM deps AS build
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM deps AS prod-deps
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache bun install --frozen-lockfile --production

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=deps /app/package.json /app/package.json
COPY --from=build /app/drizzle /app/drizzle
ENV PORT=8443
VOLUME /data
EXPOSE 8443
CMD [ "bun", "dist/main.js" ]
