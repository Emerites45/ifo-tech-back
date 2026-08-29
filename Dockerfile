# ---- Étape 1 : build ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Génération des types et du client Prisma
RUN npx prisma generate

# Build de l'application NestJS
RUN npm run build

# ---- Étape 2 : image de production (légère) ----
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Copie des fichiers compilés NestJS
COPY --from=builder /app/dist ./dist

# Copie du client Prisma généré et des binaires du CLI Prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copie du schéma Prisma et des migrations pour les exécutions au démarrage
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]