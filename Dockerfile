# =====================================================
# Primera Etapa: Instarlar dependencias de desarrollo
# =====================================================

# Imagen de node para instalar dependencias de desarrollo 
FROM node:26.3.0-alpine AS build

# Definir el directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar dependencias de desarrollo
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Compilar la aplicación Angular
RUN npm run build

# ======================================
# Segunda Etapa: Servidor NGINX 
# ======================================

# Imagen de NGINX para servir la aplicación Angular
FROM nginx:1.25.2-alpine as prod

# Copiar los archivos compilados de la aplicación Angular desde la etapa de construcción
COPY --from=build /app/dist/bequianrent/browser /usr/share/nginx/html

# Exponer el puerto 80 para acceder a la aplicación
EXPOSE 80

# Mover el archivo index.csr.html a index.html para que NGINX lo sirva correctamente
RUN mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html

# Comando para iniciar NGINX en primer plano
CMD ["nginx", "-g", "daemon off;"]