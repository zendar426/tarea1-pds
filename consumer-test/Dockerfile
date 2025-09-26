# Dockerfile para consumer-tests
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias para Pact
RUN apk add --no-cache \
    bash \
    curl \
    ca-certificates

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Crear directorio para pacts si no existe
RUN mkdir -p /app/pacts

# Variables de entorno
ENV NODE_ENV=test
ENV LICENSES_SERVICE_URL=http://licencias:3001

# Comando por defecto para ejecutar tests
CMD ["npm", "test"]