FROM node:22.12-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./

FROM deps AS build
RUN --mount=type=cache,id=npm,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM deps AS prod-deps
RUN --mount=type=cache,id=npm,target=/root/.npm npm ci --omit=dev

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=deps /app/package.json /app/package.json
COPY --from=build /app/drizzle /app/drizzle
CMD [ "node", "dist/main" ]
