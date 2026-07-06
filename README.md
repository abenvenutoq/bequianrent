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

# Datos trabajados en LocalStorage
La data que utiliza la APP se encuentra en: [Archivos De Datos](src/app/data)

---

# Datos de indicadores economicos desde API mindicador.cl 
Se agregaron funciones para traer información actulizada de indicadores desde la API las que se muestran en el footer de la aplicación
 - Valor Dolar actual
 - Valor UF actual
 - Valor UTM actual

    Servicio: [Servicio](../bequianrent/src/app/services/indicador-economico.service.ts)
    Componente (Footer): [Componente](../bequianrent/src/app/components/footer/footer.ts)

---

# Datos de estadisticas de arriendos desde JSON Local
Se agrego archivo arriendos_mensuales.json para trabajar con componente de estadisticas de arriendos desde la APP
 - 
    Servicio: [Servicio](../bequianrent/src/app/services/estadisticas.services.ts)
    Archivo JSON: [JSON](../bequianrent/public/data/arriendos_mensuales.json)
    Componente: [Componente](../bequianrent/src/app/pages/estadisticas-ventas/estadisticas-arriendos.ts)

---

# Datos de Sucursales y Oponiones (Testimonios) desde GITHUB PAGES, API Externa.
Se creo repositorio con archivos JSON coprrespondientes con data para sucursales y testimonios obtenidos desde URL GithubPages
 - 
    Dirección URL JSON Sucursales: [URL](https://abenvenutoq.github.io/bequianrent-api/sucursales.json)
    Dirección URL JSON Testimonios: [URL](https://abenvenutoq.github.io/bequianrent-api/testimonios.json)
    Servicio Sucursales: [Servicio](../bequianrent/src/app/services/sucursales.services.ts)
    Servicio Testimonio: [Servicio](../bequianrent/src/app/services/testimonios.services.ts)
    Componente Sucursales: [Componente](../bequianrent/src/app/pages/sucursales/sucursales.ts)
    Componente Testimonios: [Componente](../bequianrent/src/app/pages/testimonios/testimonios.ts)

---


# FIN README.MD


# Ejecutar estos comandos para pruebas en el computador de la oficina
```bash
$env:PATH = "C:\Users\angelo.benvenuto\node-v24.16.0;" + $env:PATH
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
---