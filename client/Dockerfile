FROM node:24.20.0-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:24.20.0-alpine AS builder
WORKDIR /app

ARG BASE_URL

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    BASE_URL=$BASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN --mount=type=secret,id=api_token,env=API_TOKEN \
    yarn build

FROM node:24.20.0-alpine AS runner
WORKDIR /app

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
    org.opencontainers.image.title="Portfolio Client" \
    org.opencontainers.image.description="Portfolio Client Website." \
    com.prathameshdhande.title="Portfolio Client" \
    com.prathameshdhande.description="Portfolio Client Website" \
    com.prathameshdhande.project="Porfolio" \
    com.prathameshdhande.repository="https://github.com/PrathameshDhande22/Portfolio-Website" \
    com.prathameshdhande.service="Nextjs Client" \
    com.prathameshdhande.version="${VERSION}"

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

RUN addgroup --system nextjs && adduser --system --ingroup nextjs nextjs

COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]