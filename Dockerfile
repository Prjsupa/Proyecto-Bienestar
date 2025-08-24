# Imagen base oficial de Node.js
FROM node:18-alpine AS base

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat

# Instalar dependencias de producción
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copia las variables de entorno antes del build
COPY .env.production .env.production

# Build de la aplicación
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY .env.production .env.production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

# Imagen final para producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Crear usuario seguro
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copiar archivos necesarios para standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 9002
ENV PORT 9002
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]