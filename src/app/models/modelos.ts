export type RolUsuario = 'cliente' | 'admin';
export type TipoMensaje = 'sucess' | 'danger' | 'warning' | 'info';

export interface Vehiculo {
    id: number;
    marca: string;
    modelo: string;
    tipo: string;
    anio: number;
    precio: number;
    disponible: Boolean;
    transmision: string;
    pasajeros: number;
    rendimiento: string;
    imagen: string;
    descripcion: string;
}

export interface Usuario {
    id: number,
    nombre: string;
    apellido: string;
    rut: string;
    correo: string;
    fechaNacimiento: string;
    direccion: string;
    password: string;
    rol: RolUsuario;
}

export interface Reserva {
    id: number;
    idVehiculo: number;
    correo: string;
    rut: string;
    fechaDesde: Date;
    fechaHasta: Date;
    total: number;
    estado: string;
}

export interface Sesion {
    id: number;
    nombre: string;
    correo: string;
    rol: RolUsuario;
    loged: Boolean;
}

export interface MensajeVista {
    tipo: TipoMensaje;
    texto: string;
}

export interface ResultadoOperacion {
    ok: boolean,
    mensaje: string
}


