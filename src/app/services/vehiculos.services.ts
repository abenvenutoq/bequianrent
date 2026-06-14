import { Injectable } from '@angular/core';

import { Vehiculo } from '../models/modelos';
import { VEHICULOS } from '../data/vehiculos.data';

@Injectable ({ providedIn: 'root'})
export class VehiculoService{
    readonly KEYS = {
        vehiculos: 'bequianrent_vehiculos'
    };

    readonly vehiculosBase: Vehiculo[] = this.clonar(VEHICULOS) as unknown as Vehiculo[];

    constructor() {
        this.iniciarlizarDatos();
    }

    iniciarlizarDatos(): void {
        if (!this.storageDisponible()) return;

        if (!localStorage.getItem(this.KEYS.vehiculos)) {
            this.saveVehiculos(this.vehiculosBase);
        }
    }
    
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

    guardarJSON<T>(clave: string, valor: T): void {
        if (!this.storageDisponible()) return;
        localStorage.setItem(clave, JSON.stringify(valor));
    }

    getVehiculos(): Vehiculo[] {
        return this.leerJSON<Vehiculo[]>(this.KEYS.vehiculos, this.vehiculosBase).map(vehiculo => ({
            ...vehiculo, imagen: this.normalizarRutaImagen(vehiculo.imagen)
        }));
    }

    getVehiculosDisp(disponible: boolean){
        return this.getVehiculos().filter(vehiculo => Boolean(vehiculo.disponible) === Boolean(disponible));
    }

    saveVehiculos(vehiculos: Vehiculo[]): void { 
        const normalizados = vehiculos.map(vehiculo => ({
            ...vehiculo,
            precio: Number(vehiculo.precio),
            anio: Number(vehiculo.anio),
            disponible: String(vehiculo.disponible) === 'true'
        }));

        this.guardarJSON(this.KEYS.vehiculos, normalizados);
    }

    getVehiculosPorId(id: number | string | null): Vehiculo | undefined {
        if (id === null || id === undefined || id === '') return undefined;
        return this.getVehiculos().find(vehiculo => Number(vehiculo.id) === Number(id));
    }

    actualizarDisponibilidad(idVehiculo: number, disponible: boolean): void {
        if (!this.storageDisponible()) return;

        const vehiculos = this.getVehiculos();
        
        const index = vehiculos.findIndex(v => Number(v.id) === Number(idVehiculo));
        
        if (index !== -1) {
            vehiculos[index].disponible = disponible;
            this.saveVehiculos(vehiculos);
        }
    }

    normalizarRutaImagen(ruta: string): string {
        const limpia = (ruta || '').trim();

        if (!limpia) return 'img/autos/auto_placeholder.jpg';
        if (limpia.startsWith('img/autos') || limpia.startsWith('img/autos/')) { return limpia;}
        if (limpia.startsWith('public/img/')) { return limpia.replace('public/','')}
        if (!limpia.includes('/')) { return `img/autos/${limpia}`} 

        return limpia;
    }

    private storageDisponible(): boolean {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }

    private sessionDisponible(): boolean {
        return typeof sessionStorage !== 'undefined';
    }

    private clonar<T>(valor: T): T {
        return JSON.parse(JSON.stringify(valor)) as T;
    }

}