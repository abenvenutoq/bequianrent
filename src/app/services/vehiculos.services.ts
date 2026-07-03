import { Injectable } from '@angular/core';

import { Vehiculo } from '../models/modelos';
import { VEHICULOS } from '../data/vehiculos.data';

/**
 * @description
 * Servicio encargado de la gestión y persistencia del inventario de vehículos de BequianRent.
 * * Este servicio realiza las siguientes tareas esenciales:
 * - Centraliza el almacenamiento local de la flota mediante el uso de LocalStorage.
 * - Provee métodos genéricos (`leerJSON`, `guardarJSON`) para una manipulación segura de datos.
 * - Normaliza estructuras de datos (rutas de imágenes y coerción de tipos de precio/año/disponibilidad).
 * - Implementa validaciones de entorno (SSR) para garantizar que la aplicación no falle en el servidor.
 */
@Injectable ({ providedIn: 'root'})
export class VehiculoService{
    /** Diccionario de constantes con las llaves utilizadas para persistir datos en LocalStorage. */
    readonly KEYS = {
        vehiculos: 'bequianrent_vehiculos'
    };

    /** Colección base de vehículos obtenida desde los datos semilla estáticos (`VEHICULOS`).
     * Se clona profundamente para evitar mutaciones directas en la constante original.
     */
    readonly vehiculosBase: Vehiculo[] = this.clonar(VEHICULOS) as unknown as Vehiculo[];

    /**
     * Constructor del servicio.
     * Invoca automáticamente la inicialización de los datos del inventario en el almacenamiento local.
     */
    constructor() {
        this.inicializarDatos();
    }

    /**
     * Sienta las bases de datos iniciales de la flota en el navegador.
     * Si la clave del inventario no existe en el LocalStorage, inyecta automáticamente los vehículos semilla.
     */
    inicializarDatos(): void {
        if (!this.storageDisponible()) return;

        if (!localStorage.getItem(this.KEYS.vehiculos)) {
            this.saveVehiculos(this.vehiculosBase);
        }
    }
    
    /**
     * Método genérico para la lectura segura de datos almacenados en LocalStorage.
     * Incluye manejo de excepciones y devoluciones de respaldo en caso de errores de serialización o contextos SSR.
     * @param {string} clave Llave del LocalStorage a consultar.
     * @param {T} respaldo Valor predeterminado que se devolverá en caso de no encontrar datos o ante un fallo.
     * @returns {T} El objeto parseado de tipo `T` o su versión de respaldo clonada.
     */
    leerJSON<T>(clave: string, respaldo: T): T {
        if (!this.storageDisponible()) return this.clonar(respaldo);

        const valor = localStorage.getItem(clave);

        if (!valor) {
            return this.clonar(respaldo);
        }

        try {
            return JSON.parse(valor) as T;
        } catch {
            return this.clonar(respaldo);
        }
    }

    /**
     * Método genérico para guardar estructuras de datos en el LocalStorage, validando la disponibilidad del navegador.
     * @param {string} clave Llave bajo la cual se persistirá la información.
     * @param {T} valor Estructura u objeto de tipo genérico `T` a convertir en string y almacenar.
     */
    guardarJSON<T>(clave: string, valor: T): void {
        if (!this.storageDisponible()) return;
        localStorage.setItem(clave, JSON.stringify(valor));
    }

    /**
     * Recupera el inventario completo de vehículos desde el almacenamiento persistente.
     * Al leerlos, pasa cada ruta de imagen por un proceso de normalización para asegurar que se rendericen correctamente.
     * @returns {Vehiculo[]} Arreglo completo de objetos de tipo {@link Vehiculo}.
     */
    getVehiculos(): Vehiculo[] {
        return this.leerJSON<Vehiculo[]>(this.KEYS.vehiculos, this.vehiculosBase).map(vehiculo => ({
            ...vehiculo, imagen: this.normalizarRutaImagen(vehiculo.imagen)
        }));
    }

    /**
     * Obtiene una lista filtrada del inventario de acuerdo a su estado de disponibilidad.
     * @param {boolean} disponible Estado deseado (`true` para vehículos libres, `false` para vehículos arrendados).
     * @returns {Vehiculo[]} Arreglo de vehículos que coinciden con el estado solicitado.
     */
    getVehiculosDisp(disponible: boolean){
        return this.getVehiculos().filter(vehiculo => Boolean(vehiculo.disponible) === Boolean(disponible));
    }

    /**
     * Procesa, normaliza y guarda la colección completa de vehículos en el LocalStorage.
     * Aplica coerción de tipos (transforma precios y años a `Number`, y disponibilidad a `boolean`)
     * garantizando que los datos ingresados desde formularios sean consistentes antes de guardarse.
     * @param {Vehiculo[]} vehiculos Arreglo con la flota de vehículos a persistir.
     */
    saveVehiculos(vehiculos: Vehiculo[]): void { 
        const normalizados = vehiculos.map(vehiculo => ({
            ...vehiculo,
            precio: Number(vehiculo.precio),
            anio: Number(vehiculo.anio),
            disponible: String(vehiculo.disponible) === 'true'
        }));

        this.guardarJSON(this.KEYS.vehiculos, normalizados);
    }

    /**
     * Busca y retorna un vehículo específico en base a su identificador único.
     * @param {number | string | null} id El identificador del vehículo a buscar.
     * @returns {Vehiculo | undefined} El objeto {@link Vehiculo} si existe, o `undefined` si no se encuentra o el ID es nulo.
     */
    getVehiculosPorId(id: number | string | null): Vehiculo | undefined {
        if (id === null || id === undefined || id === '') return undefined;
        return this.getVehiculos().find(vehiculo => Number(vehiculo.id) === Number(id));
    }

    /**
     * Actualiza y persiste de manera individual el estado de disponibilidad de un solo vehículo.
     * @param {number} idVehiculo Identificador único del vehículo a modificar.
     * @param {boolean} disponible Nuevo estado (`true` si está libre, `false` si se ha reservado).
     */
    actualizarDisponibilidad(idVehiculo: number, disponible: boolean): void {
        if (!this.storageDisponible()) return;

        const vehiculos = this.getVehiculos();
        
        const index = vehiculos.findIndex(v => Number(v.id) === Number(idVehiculo));
        
        if (index !== -1) {
            vehiculos[index].disponible = disponible;
            this.saveVehiculos(vehiculos);
        }
    }

    /**
     * Evalúa y corrige de forma preventiva las rutas de las imágenes de los vehículos.
     * Garantiza que, sin importar cómo se haya guardado o tipeado la URL, la vista de usuario renderice correctamente la imagen.
     * Si el string viene vacío, asigna una imagen de "placeholder" por defecto.
     * @param {string} ruta Cadena de texto correspondiente a la URL o path de la imagen.
     * @returns {string} Ruta absoluta limpia y normalizada para el atributo `src`.
     */
    normalizarRutaImagen(ruta: string): string {
        const limpia = (ruta || '').trim();

        if (!limpia) return 'img/autos/auto_placeholder.jpg';
        if (limpia.startsWith('img/autos') || limpia.startsWith('img/autos/')) { return limpia;}
        if (limpia.startsWith('public/img/')) { return limpia.replace('public/','')}
        if (!limpia.includes('/')) { return `img/autos/${limpia}`} 

        return limpia;
    }

    /**
     * Valida de manera segura si las APIs globales del navegador (window y localStorage) 
     * están disponibles, evitando crasheos durante el Server-Side Rendering (SSR).
     * @private
     * @returns {boolean} `true` si el código se ejecuta en el navegador, `false` en el servidor.
     */
    private storageDisponible(): boolean {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }

    /**
     * Utilidad auxiliar genérica para realizar copias profundas (Deep Copy) de objetos y arreglos.
     * Rompe la referencia en memoria del objeto original utilizando el motor V8 de Javascript (JSON parse/stringify).
     * @private
     * @param {T} valor Objeto o estructura que se desea clonar.
     * @returns {T} Una copia idéntica pero con una dirección de memoria desvinculada.
     */
    private clonar<T>(valor: T): T {
        return JSON.parse(JSON.stringify(valor)) as T;
    }

}