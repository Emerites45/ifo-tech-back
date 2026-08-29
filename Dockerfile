# ---- Étape 1 : build ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Génère le client Prisma AVANT le build (nécessite le CLI prisma,
# disponible ici car cette étape installe aussi les devDependencies)
RUN npx prisma generate

RUN npm run build

# ---- Étape 2 : image de production (légère) ----
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Récupère le client Prisma déjà généré dans l'étape précédente,
# sans avoir besoin du CLI prisma (devDependency) en production
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Nécessaire si tu comptes lancer "prisma migrate deploy" au démarrage
# du conteneur (schema.prisma requis à l'exécution)
COPY --from=builder /app/prisma ./prisma

# Adapte le port si ton app NestJS écoute ailleurs (voir main.ts)
EXPOSE 3000

CMD ["node", "dist/main.js"]
