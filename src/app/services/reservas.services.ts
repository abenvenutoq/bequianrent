import { Injectable } from '@angular/core';
import { Reserva } from '../models/modelos';

@Injectable({ providedIn: 'root' })
export class ReservaService {
    private readonly claveReservas = 'bequianrent_reservas';

    private isBrowser(): boolean {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }

    obtenerReservas(): Reserva[] {
        if (!this.isBrowser()) return [];
        const datos = localStorage.getItem(this.claveReservas);
        return datos ? JSON.parse(datos) as Reserva[] : [];
    }

    guardarReservas(reservas: Reserva[]): void {
        if (!this.isBrowser()) return;
        localStorage.setItem(this.claveReservas, JSON.stringify(reservas));
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
}