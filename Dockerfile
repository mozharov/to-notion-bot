ARG BASE_IMAGE=amd64/node:20.11-alpine


## Development stage
FROM ${BASE_IMAGE} As development

RUN mkdir -p /app/node_modules && chown -R node:node /app
WORKDIR /app
COPY --chown=node:node package*.json ./
USER node
RUN npm ci
COPY --chown=node:node . .


## Build stage
FROM ${BASE_IMAGE} AS build

RUN mkdir -p /app/node_modules && chown -R node:node /app
WORKDIR /app
COPY --chown=node:node --from=development /app/package*.json ./
COPY --chown=node:node --from=development /app/node_modules ./node_modules
COPY --chown=node:node --from=development /app/src ./src
COPY --chown=node:node --from=development /app/tsconfig*.json ./
USER node
RUN npm run build
RUN npm ci --omit=dev && npm cache clean --force


## Production stage
FROM ${BASE_IMAGE} AS production

RUN mkdir -p /app/node_modules && chown -R node:node /app
WORKDIR /app
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
USER node
CMD ["node", "dist/main"]