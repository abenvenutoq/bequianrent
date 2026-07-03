/**
 * @description
 * Define los niveles de acceso y privilegios dentro de la plataforma.
 * - `cliente`: Usuario estándar que puede arrendar vehículos.
 * - `admin`: Administrador con acceso al panel de control y gestión global.
 */
export type RolUsuario = 'cliente' | 'admin';

/**
 * @description
 * Define las variantes de color/estado para las alertas visuales en la interfaz,
 * comúnmente alineadas con las clases de Bootstrap (success, danger, warning, info).
 */
export type TipoMensaje = 'sucess' | 'danger' | 'warning' | 'info';

/**
 * @description
 * Representa la entidad física de un automóvil dentro del catálogo de la empresa.
 */
export interface Vehiculo {
    /** Identificador único del vehículo. */
    id: number;
    /** Marca del fabricante (ej. Toyota, Ford). */
    marca: string;
    /** Modelo específico del vehículo. */
    modelo: string;
    /** Categoría del vehículo (ej. SUV, Sedán, Hatchback). */
    tipo: string;
    /** Año de fabricación. */
    anio: number;
    /** Costo de arriendo por día en moneda local. */
    precio: number;
    /** Indica si el vehículo está libre para ser arrendado (`true`) o si ya está ocupado (`false`). */
    disponible: boolean;
    /** Tipo de caja de cambios (ej. Manual, Automática). */
    transmision: string;
    /** Capacidad máxima de personas que el vehículo puede transportar de forma segura. */
    pasajeros: number;
    /** Eficiencia de combustible estimada (ej. 15 km/l). */
    rendimiento: string;
    /** Ruta local o URL de la fotografía del vehículo para mostrar en el catálogo. */
    imagen: string;
    /** Breve reseña comercial o características destacadas del automóvil. */
    descripcion: string;
}

/**
 * @description
 * Representa a un cliente o administrador registrado en el sistema.
 */
export interface Usuario {
    /** Identificador numérico único autoincremental del usuario. */
    id: number;
    /** Nombre de pila. */
    nombre: string;
    /** Apellido paterno/materno. */
    apellido: string;
    /** Rol Único Tributario (formato chileno) que actúa como identificador legal. */
    rut: string;
    /** Correo electrónico, utilizado también como credencial de acceso (login). */
    correo: string;
    /** Fecha de nacimiento en formato YYYY-MM-DD. */
    fechaNacimiento: string;
    /** Dirección física de residencia (campo opcional en el registro). */
    direccion: string;
    /** Contraseña encriptada o en texto plano para la validación de credenciales. */
    password: string;
    /** Define los permisos que tiene el usuario dentro de la plataforma. */
    rol: RolUsuario;
}

/**
 * @description
 * Representa una transacción de arriendo o reserva de un vehículo realizada por un usuario.
 */
export interface Reserva {
    /** Identificador numérico único de la transacción. */
    id: number;
    /** ID del vehículo que está siendo arrendado. */
    idVehiculo: number;
    /** Correo del usuario que realizó la reserva. Actúa como llave foránea lógica. */
    correo: string;
    /** RUT del usuario arrendatario. */
    rut: string;
    /** Fecha de inicio del periodo de arriendo (YYYY-MM-DD). */
    fechaDesde: string;
    /** Fecha de término y devolución del vehículo (YYYY-MM-DD). */
    fechaHasta: string;
    /** Monto monetario total calculado a pagar por todos los días de reserva. */
    total: number;
    /** Situación actual de la reserva (ej. 'Confirmada', 'Pendiente', 'Cancelada'). */
    estado: string;
}

/**
 * @description
 * Estructura de datos almacenada temporalmente para manejar el estado de autenticación
 * del usuario en el navegador (LocalStorage o SessionStorage).
 */
export interface Sesion {
    /** ID del usuario autenticado. */
    id: number;
    /** Nombre del usuario para mostrar mensajes de bienvenida en la UI. */
    nombre: string;
    /** Correo electrónico que identifica la sesión. */
    correo: string;
    /** Rol actual del usuario para habilitar/deshabilitar menús protegidos. */
    rol: RolUsuario;
    /** Bandera que confirma si la sesión está activa y validada de forma exitosa. */
    loged: boolean;
}

/**
 * @description
 * Estructura utilizada para emitir notificaciones dinámicas en pantalla.
 */
export interface MensajeVista {
    /** Determina el color o icono de la notificación (ej. 'danger' para errores). */
    tipo: TipoMensaje;
    /** El cuerpo del mensaje o instrucción a mostrar al usuario. */
    texto: string;
}

/**
 * @description
 * Patrón estándar de retorno para operaciones de negocio o servicios que realizan lógica compleja.
 * Evita retornar múltiples tipos de datos, unificando la respuesta.
 */
export interface ResultadoOperacion {
    /** `true` si el proceso finalizó con éxito, `false` si hubo un error o validación fallida. */
    ok: boolean;
    /** Mensaje descriptivo sobre el resultado (útil para inyectarlo directamente en alertas de la UI). */
    mensaje: string;
}

export interface SerieIndicador {
  fecha: string;
  valor: number;
}

export interface IndicadorEconomico {
  version: string;
  autor: string;
  codigo: string;
  nombre: string;
  unidad_medida: string;
  serie: SerieIndicador[];
}