FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
RUN pnpm install --frozen-lockfile --filter @sonari/api...

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages/types ./packages/types
COPY packages/config ./packages/config
ENV CI=true
RUN pnpm --filter @sonari/types build && pnpm --filter @sonari/api build
# Flatten prod deps — pnpm workspace symlinks break when copied to the runner stage
RUN pnpm --filter @sonari/api --prod deploy --legacy /prod/api
RUN test -f /prod/api/dist/index.js && test -d /prod/api/node_modules/fastify

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001
COPY --from=build /prod/api .
EXPOSE 3001
CMD ["node", "dist/index.js"]
