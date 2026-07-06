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
* **Estrategia de Persistencia:** LocalStorage y SessionStorage (Simulación de Base de Datos y Sesiones Activas)
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
Integración para obtener y mostrar el valor diario del Dólar, la UF y la UTM.
* **Modelo:** `indicadores.model.ts`
* **Servicio:** `indicadores.service.ts`
* **Componente UI:** `footer.ts`

### 📊 Uso de Estadísticas
Se implementó una tabla para visualizar las estadísticas mensuales de arriendos desde la aplicación.
* **Servicio:** `estadisticas.services.ts`
* **Archivo JSON Local:** `arriendos_mensuales.json`
* **Componente:** `estadisticas-arriendos.ts`

### 🏢 Datos de Sucursales y Opiniones (GitHub Pages)
Se creó un repositorio externo con archivos JSON correspondientes a la data de sucursales y testimonios, obtenidos consumiendo una API estática alojada en GitHub Pages.
* **API Sucursales:** [sucursales.json](https://abenvenutoq.github.io/bequianrent-api/sucursales.json)
* **API Testimonios:** [testimonios.json](https://abenvenutoq.github.io/bequianrent-api/testimonios.json)
* **Servicios:** `sucursales.services.ts` | `testimonios.services.ts`
* **Componentes:** `sucursales.ts` | `testimonios.ts`

---
*BequianRent - Proyecto Académico DuocUC*

# FIN README.MD

# Ejecutar estos comandos para pruebas en el computador de la oficina
```bash
$env:PATH = "C:\Users\angelo.benvenuto\node-v24.16.0;" + $env:PATH
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
---