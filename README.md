# BequianRent - Sistema de Arriendo de Vehículos

¡Bienvenido a **BequianRent**! Una aplicación web SPA desarrollada en Angular en base a las clases de FullStack 2 de DuocUC Online

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

# Datos trabajados en LocalStorage
La data que utiliza la APP se encuentra en: [Archivos De Datos](src/app/data)