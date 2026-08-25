FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app

ARG BASE_URL

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    BASE_URL=$BASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN --mount=type=secret,id=api_token,env=API_TOKEN \
    yarn build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
