# BequianRent - Sistema de Arriendo de Vehículos

¡Bienvenido a **BequianRent**! Una aplicación desarrollada en Angular en base a las clases de FullStack 2 de DuocUC Online

---

## Cuentas de Prueba (Credenciales)
Para facilitar la revisión y corrección de las funcionalidades de la rúbrica, puedes utilizar los siguientes usuarios preconfigurados en el sistema:

### Rol Administrador (Admin Panel)
* **Correo:** `admin@bequianrent.cl`
* **Contraseña:** `*Qwe123`

### Rol Cliente (Catálogo y Reservas)
* **Correo:** `cliente@gmail.com`
* **Contraseña:** `*Qwe123`

---

## Guía de Inicio Rápido

### 1. Instalar Dependencias
Antes de levantar el proyecto por primera vez, descarga e instala los paquetes y librerías necesarias ejecutando en la terminal:
```bash
npm install
```

### 2. Ejecutar el Servidor de Desarrollo
```bash
ng serve
```
o bien utilizar (Abrira directamente una ventana con el web browser por defecto)
```bash
ng serve -o 
```
### 3. Ejecutar Pruebas Unitarias (Testing)
```bash
ng test
```

### 4. Generar y Levantar Documentación (Compodoc)
```bash
npx compodoc -p tsconfig.app.json -s
```
**Nota:** Una vez que la terminal indique que el servidor de Compodoc está listo, puedes navegar y revisar toda la arquitectura del proyecto ingresando a: http://127.0.0.1:8080/.

--- 

# 🛠️ Tecnologías y Herramientas Utilizadas

* **Framework:** Angular v22.0.0 (Componentes Standalone)
* **Estilos:** Bootstrap v5.3 (Diseño responsivo y adaptativo)
* **Estrategia de Persistencia:** LocalStorage y SessionStorage, consumo archivos JSON desde API's Externas, GithubPages y archivo local. Para la semana 8 se implemento CRUD en JSON Server. (Simulación de Base de Datos y Sesiones Activas)
* **Gestor de Pruebas:** Vitest (Pruebas unitarias de lógica y comportamiento)
* ***Documentación:** Compodoc

--- 

# Comandos para verificar versiones instaladas

Sirven para revisar si tienes Node, npm y Angular instalados.
```bash
node -v 
npm -v
ng version
```
Si ng no funciona, prueba:
```bash
npx ng versión
```

---

## 🛠️ Características y Arquitectura del Proyecto

### 🛡️ Guards en Angular
Protección de rutas sensibles (Panel de Administración).
* **Archivo:** `admin.guard.ts`
* **Funcionamiento:** Evalúa a través de `AuthService` si la sesión activa corresponde al rol `admin`. Si no es administrador, bloquea el acceso.

### 📈 Consumo API Externa (`mindicador.cl`)
Integración para obtener y mostrar el valor diario del Dólar, la UF y la UTM. Esta información se despliega en el footer.
* **Servicio:** [indicador-economico.service.ts](../bequianrent/src/app/services/indicador-economico.service.ts)
* **Componente UI:** [footer.ts](../bequianrent/src/app/components/footer/footer.ts)

### 📊 Uso de Estadísticas
Se implementó una tabla para visualizar las estadísticas mensuales de arriendos desde la aplicación.
* **Servicio:** [estadisticas.services.ts](../bequianrent/src/app/services/estadisticas.services.ts)
* **Archivo JSON Local:** [arriendos_mensuales.json](../bequianrent/public/data/arriendos_mensuales.json)
* **Componente:** [estadisticas-arriendos.ts](../bequianrent/src/app/pages/estadisticas-arriendos/estadisticas-arriendos.ts)

### 🏢 Datos de Opiniones (GitHub Pages)
Se creó un repositorio externo con archivos JSON correspondientes a la data de sucursales y testimonios, obtenidos consumiendo una API estática alojada en GitHub Pages.
* **API Testimonios:** [testimonios.json](https://abenvenutoq.github.io/bequianrent-api/testimonios.json)
* **Servicios:** [testimonios.services.ts](../bequianrent/src/app/services/testimonios.services.ts)
* **Componentes:** [sucursales.ts](../bequianrent/src/app/pages/sucursales/sucursales.ts) | [testimonios.ts](../bequianrent/src/app/pages/testimonios/testimonios.ts)

### 🏢 Datos Sucursales (Github Pages + LocalStorage)
Se migro consumo de datos de Sucursal desde Github Pages hacia consumo mixto junto a LocalStorage, se implemento CRUD para datos persistentes para simular backend.
* **API Sucursales:** [sucursales.json](https://abenvenutoq.github.io/bequianrent-api/sucursales.json)
* **Servicios:** [sucursales.services.ts](../bequianrent/src/app/services/sucursales.services.ts)
* **Componentes Lectura todos los usuarios:** [sucursales.ts](../bequianrent/src/app/pages/sucursales/sucursales.ts)
* **Componente Mantenedor solo admin:** [mantenedor-sucursales.ts](../bequianrent/src/app/pages/mantenedor-sucursales/mantenedor-sucursales.ts)

### 🚗 Datos de Vehiculos (JSON Server)
Se migro data de vehiculos de LocalStorage hacia JSON Server 
* **Archivo db.json:** [db.json](../bequianrent/db.json)
* **Servicio:** [vehiculos-json-server.services.ts](../bequianrent/src/app/services/vehiculos-json-server.services.ts)
* **Compponente Mantenedor solo admin:** [mantenedor-vehiculos.ts](../bequianrent/src/app/pages/mantenedor-vehiculos/mantenedor-vehiculos.ts)
* **Componente lectura para visitantes y usuarios:** [ver-autos.ts](../bequianrent/src/app/pages/ver-autos/ver-autos.ts)


---
*BequianRent - Proyecto Académico DuocUC*

# FIN README.MD

# Ejecutar estos comandos para pruebas en el computador de la oficina
```bash
$env:PATH = "C:\Users\angelo.benvenuto\node-v24.16.0;" + $env:PATH
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
---

# COMANDOS DOCKER 

 docker compose up -d --build 

🧪 Comandos Docker locales

Construir imagen:
```bash
docker build -t mi-app-angular .
```

Ejecutar contenedor:
```bash
docker run --name mi-app-angular -p 8080:80 mi-app-angular
```

Abrir en navegador:

http://localhost:8080

Detener contenedor:
```bash
docker stop mi-app-angular
```

Eliminar contenedor:
```bash
docker rm mi-app-angular
```

Ver imágenes:
```bash
docker images
```

Ver contenedores activos:
```bash
docker ps
```

Ver todos los contenedores:
```bash
docker ps -a
```

Eliminar imagen:
```bash
docker rmi mi-app-angular
```

