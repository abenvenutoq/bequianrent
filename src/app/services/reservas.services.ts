import { Injectable } from '@angular/core';
import { Reserva } from '../models/modelos';
import { RESERVAS } from '../data/reservas.data';

@Injectable({ providedIn: 'root' })
export class ReservaService {
    readonly KEYS = {
        reservas: 'bequianrent_reservas'
    };

    readonly reservasBase: Reserva[] = this.clonar(RESERVAS) as unknown as Reserva[];

    constructor() {
        this.inicializarDatos();
    }
    
    inicializarDatos(): void {
        if (!this.storageDisponible()) return;

        const datosActuales = localStorage.getItem(this.KEYS.reservas);

        // Si la clave no existe en el navegador, O si existe pero es un arreglo vacío "[]"
        if (!datosActuales || datosActuales === '[]') {
            this.guardarReservas(this.reservasBase);
        }
    }

    obtenerReservas(): Reserva[] {
        if (!this.storageDisponible()) return [];
        const datos = localStorage.getItem(this.KEYS.reservas);
        return datos ? JSON.parse(datos) as Reserva[] : [];
    }

    guardarReservas(reservas: Reserva[]): void {
        if (!this.storageDisponible()) return;
        localStorage.setItem(this.KEYS.reservas, JSON.stringify(reservas));
    }

    crearReserva(nuevaReserva: Omit<Reserva, 'id'>): void {
        const reservas = this.obtenerReservas();
        const id = this.generarId(reservas);
        
        reservas.push({ ...nuevaReserva, id });
        this.guardarReservas(reservas);
    }

    private generarId(lista: Reserva[]): number {
        if (lista.length === 0) return 1;
        return Math.max(...lista.map(r => Number(r.id))) + 1;
    }

    // Unificamos la validación del entorno en una sola función
    private storageDisponible(): boolean {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }

    private clonar<T>(valor: T): T {
        return JSON.parse(JSON.stringify(valor)) as T;
    }
}