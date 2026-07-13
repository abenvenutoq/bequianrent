#Primera Etapa: Instarlar dependencias de desarrollo
FROM node:26.3.0 AS dev-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

#Segunda Etapa: Construir la aplicación
FROM node:26.3.0 AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

#Etapa Final: Servir la aplicación con Nginx
FROM nginx:1.25.2-alpine AS prod
EXPOSE 80
COPY --from=builder /app/dist/bequianrent/browser /usr/share/nginx/html

RUN mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html

CMD ["nginx", "-g", "daemon off;"]