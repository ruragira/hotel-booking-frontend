
# Étape 1 : construire l'application Vue.js
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Configuration de l'API et de la devise
ARG VITE_API_URL=/api/v1
ARG VITE_CURRENCY=USD

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CURRENCY=$VITE_CURRENCY

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le code source
COPY . .

# Compiler Vue.js
RUN npm run build

# Étape 2 : servir l'application avec Nginx
FROM nginx:alpine

# Supprimer la configuration Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Ajouter notre configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers compilés
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
