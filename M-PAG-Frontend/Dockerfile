# M-PAGe Frontend Dockerfile (Vite + React)
FROM node:20-alpine

WORKDIR /app

# Copier package.json et package-lock.json
COPY package.json package-lock.json* ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Exposer le port 5173 (port par défaut de Vite)
EXPOSE 5173

# Démarrer Vite en mode développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
