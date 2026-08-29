# ---- Étape 1 : build ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

# On utilise npm install pour qu'il génère/s'adapte à l'OS Linux Alpine sans bloquer
RUN npm install

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

# Installation des dépendances de prod en s'adaptant à Linux
RUN npm install --omit=dev

# Copie des fichiers compilés NestJS
COPY --from=builder /app/dist ./dist

# Copie du client Prisma et du CLI Prisma pour les migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copie du schéma et des migrations Prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]