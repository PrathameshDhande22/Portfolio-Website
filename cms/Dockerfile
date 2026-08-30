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
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
RUN groupadd --system --gid 1001 strapi && useradd --system --uid 1001 --gid strapi strapi

ARG BUILD_DATE
ARG GIT_SHA
ARG VERSION

LABEL org.opencontainers.image.created="${BUILD_DATE}" \
    org.opencontainers.image.authors="prathamesh Dhande" \
    org.opencontainers.image.source="https://github.com/PrathameshDhande22/Portfolio-Website" \
    org.opencontainers.image.version="${VERSION}" \
    org.opencontainers.image.url="https://github.com/PrathameshDhande22/Portfolio-Website" \
    org.opencontainers.image.revision="${GIT_SHA}" \
    org.opencontainers.image.vendor="PrathameshDhande22" \
    org.opencontainers.image.title="Strapi CMS" \
    org.opencontainers.image.description="Strapi CMS to manage the data of the Portfolio Website." \
    com.prathameshdhande.title="Strapi CMS" \
    com.prathameshdhande.description="CMS to manage the Porfolio Website" \
    com.prathameshdhande.project="Porfolio" \
    com.prathameshdhande.repository="https://github.com/PrathameshDhande22/Portfolio-Website" \
    com.prathameshdhande.service="Strapi CMS" \
    com.prathameshdhande.version="${VERSION}"

COPY --from=prod-deps --chown=strapi:strapi /app/node_modules ./node_modules
COPY --from=builder --chown=strapi:strapi /app/dist ./dist
COPY --from=builder --chown=strapi:strapi /app/config ./config
COPY --from=builder --chown=strapi:strapi /app/database ./database
COPY --from=builder --chown=strapi:strapi /app/src ./src
COPY --from=builder --chown=strapi:strapi /app/public ./public
COPY --from=builder --chown=st                                                                                                                                                                                                                                                                                  rapi:strapi /app/package.json /app/favicon.png /app/tsconfig.json ./

USER strapi
EXPOSE 1337

HEALTHCHECK --interval=10s --timeout=5s --start-period=120s --retries=40 CMD curl -fsS http://127.0.0.1:1337/_health || exit 1

CMD ["yarn", "start"]
