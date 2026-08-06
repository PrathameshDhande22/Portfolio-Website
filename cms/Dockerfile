FROM node:24-slim AS base
WORKDIR /app

FROM base AS build-deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 build-essential \
    && rm -rf /var/lib/apt/lists/*
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

FROM base AS builder
ENV NODE_ENV=production
COPY --from=build-deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM base AS prod-deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --network-timeout 600000 \
    && yarn cache clean \
    && rm -rf node_modules/.cache

FROM base AS runner
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=1337
RUN groupadd --system --gid 1001 strapi && useradd --system --uid 1001 --gid strapi strapi

COPY --from=prod-deps --chown=strapi:strapi /app/node_modules ./node_modules
COPY --from=builder --chown=strapi:strapi /app/dist ./dist
COPY --from=builder --chown=strapi:strapi /app/config ./config
COPY --from=builder --chown=strapi:strapi /app/database ./database
COPY --from=builder --chown=strapi:strapi /app/src ./src
COPY --from=builder --chown=strapi:strapi /app/public ./public
COPY --from=builder --chown=strapi:strapi /app/package.json /app/favicon.png /app/tsconfig.json ./

USER strapi
EXPOSE 1337
CMD ["yarn", "start"]
