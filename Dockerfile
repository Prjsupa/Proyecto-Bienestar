# Imagen base oficial de Node.js 22 con Alpine (más ligera)
FROM node:22-alpine AS base

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Etapa de dependencias - optimizada con cache
FROM base AS deps
# Copiar solo archivos de dependencias para mejor cache
COPY package*.json ./
# Usar npm ci con cache optimizado
RUN npm ci --ignore-scripts --cache .npm

# Etapa de builder - optimizada
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para optimización
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

# Build optimizado
RUN npm run build

# Etapa final - ultra ligera
FROM base AS runner
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=9002
ENV HOSTNAME="0.0.0.0"

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copiar solo archivos necesarios para producción
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Cambiar permisos y usuario
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 9002

CMD ["node", "server.js"]