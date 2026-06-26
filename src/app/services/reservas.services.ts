import { Injectable } from '@angular/core';
import { Reserva } from '../models/modelos';
import { RESERVAS } from '../data/reservas.data';

/**
 * @description
 * Servicio encargado de la persistencia y gestión del ciclo de vida de las reservas de arriendo de vehículos.
 * * Este servicio realiza las siguientes tareas esenciales:
 * - Centraliza el almacenamiento local de las reservas mediante LocalStorage.
 * - Agregamosdatos iniciales en el sistema si el almacenamiento está vacío.
 * - Controla de forma autoincremental los identificadores de nuevos registros.
 * - Implementa seguridad de entorno (SSR) para garantizar estabilidad tanto en el servidor como en el cliente.
 */
@Injectable({ providedIn: 'root' })
export class ReservaService {
    
    /** Diccionario de constantes que contiene las llaves de acceso para el LocalStorage del browser. */
    readonly KEYS = {
        reservas: 'bequianrent_reservas'
    };

    /** Colección base clonada a partir del archivo estático de datos semilla (`RESERVAS`). 
     * Evita problemas de mutación directa en memoria.
     */
    readonly reservasBase: Reserva[] = this.clonar(RESERVAS) as unknown as Reserva[];

    /**
     * Constructor del servicio.
     * Invoca automaticamente la inicialización de los datos de reserva en el almacenamiento local.
     */
    constructor() {
        this.inicializarDatos();
    }
    
    /**
     * Sienta las bases de datos iniciales en el browser.
     * Si la clave de reservas no existe en el LocalStorage o corresponde a un arreglo vacío (`[]`),
     * inyecta automaticamente las reservas base preconfiguradas del sistema.
     */
    inicializarDatos(): void {
        if (!this.storageDisponible()) return;

        const datosActuales = localStorage.getItem(this.KEYS.reservas);

        // Si la clave no existe en el browser, O si existe pero es un arreglo vacío "[]"
        if (!datosActuales || datosActuales === '[]') {
            this.guardarReservas(this.reservasBase);
        }
    }

    /**
     * Recupera el listado completo de las reservas del sistema almacenadas en el LocalStorage.
     * @returns {Reserva[]} Un arreglo con todos los objetos {@link Reserva} registrados, o un arreglo vacío en entornos SSR.
     */
    obtenerReservas(): Reserva[] {
        if (!this.storageDisponible()) return [];
        const datos = localStorage.getItem(this.KEYS.reservas);
        return datos ? JSON.parse(datos) as Reserva[] : [];
    }

    /**
     * Serializa y sobrescribe de forma persistente la colección de reservas en el almacenamiento local.
     * @param {Reserva[]} reservas El arreglo completo de reservas actualizadas que se procederá a almacenar.
     */
    guardarReservas(reservas: Reserva[]): void {
        if (!this.storageDisponible()) return;
        localStorage.setItem(this.KEYS.reservas, JSON.stringify(reservas));
    }

    /**
     * Registra una nueva reserva dentro de la base de datos persistente.
     * Omite el ID de entrada, lo calcula automáticamente mediante la lógica autoincremental y lo añade al almacenamiento.
     * @param {Omit<Reserva, 'id'>} nuevaReserva El payload completo de la reserva sin el campo identificador único.
     */
    crearReserva(nuevaReserva: Omit<Reserva, 'id'>): void {
        const reservas = this.obtenerReservas();
        const id = this.generarId(reservas);
        
        reservas.push({ ...nuevaReserva, id });
        this.guardarReservas(reservas);
    }

    /**
     * Genera de forma autoincremental un nuevo identificador numérico único para las reservas.
     * * Comportamiento:
     * - Si la lista está vacía, devuelve el ID base `1`.
     * - Si ya existen elementos, extrae el ID máximo actual utilizando desestructuración (`...`) y le suma `1`.
     * * @private
     * @param {Reserva[]} lista Colección actual de reservas sobre la cual buscar el ID máximo.
     * @returns {number} El identificador autoincremental numérico listo para asignarse.
     */
    private generarId(lista: Reserva[]): number {
        if (lista.length === 0) return 1;
        return Math.max(...lista.map(r => Number(r.id))) + 1;
    }

    /**
     * Valida de manera segura si las APIs globales del browser (`window` y `localStorage`) están disponibles en el hilo actual.
     * Bloquea la ejecución en el servidor durante el Server-Side Rendering (SSR) evitando excepciones críticas.
     * @returns {boolean} `true` si el código corre del lado del cliente/browser, de lo contrario `false`.
     */
    storageDisponible(): boolean {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }

    /**
     * Utilidad auxiliar para realizar copias de objetos o arreglos mediante serialización JSON.
     * Rompe la referencia por dirección de memoria original de los objetos de Javascript.
     * @param {any} objeto Estructura de datos u objeto genérico que se desea clonar.
     * @returns {any} Una copia idéntica y totalmente desvinculada del objeto original.
     */
    clonar(objeto: any): any {
        return JSON.parse(JSON.stringify(objeto));
    }
}