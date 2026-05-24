# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de configuration de dépendances
COPY package*.json ./
COPY tsconfig.json ./

# Installation de TOUTES les dépendances (y compris dev pour le build)
RUN npm ci

# Copie du code source et des configurations
COPY src ./src
COPY config ./config
COPY endpoint_alias.yaml ./endpoint_alias.yaml

# Compilation TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Variable d'environnement pour la production
ENV NODE_ENV=production

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/config ./config
COPY --from=builder /app/endpoint_alias.yaml ./endpoint_alias.yaml

# Copie des assets (images, etc.) s'ils ne sont pas dans src (ils sont dans src/app/assets dans ce projet)
# Note: tsc ne copie pas les fichiers non-TS, on les copie manuellement si besoin dans build
COPY --from=builder /app/src/app/assets ./build/app/assets

# Installation uniquement des dépendances de production
RUN npm ci --omit=dev

# Commande de lancement
CMD ["npm", "start"]
