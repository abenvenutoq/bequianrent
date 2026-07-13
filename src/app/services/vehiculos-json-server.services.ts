import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

import { Vehiculo } from "../models/modelos";

/**
 * @description
 * Servicio para interactuar con el servidor JSON de vehiculos.
 */
@Injectable({
    providedIn: "root"
})
export class VehiculosJsonServerService{


    /** URL base de la API de vehiculos */
    private readonly apiUrl = 'http://localhost:3000/vehiculos';

    constructor(private readonly http: HttpClient){}

    /** Metodo para obtener todos los vehiculos */
    getVehiculo(): Observable<Vehiculo[]> {
        return this.http.get<Vehiculo[]>(this.apiUrl);
    }

    /** Metodo para agregar un vehiculo */
    addVehiculo(vehiculo: Omit<Vehiculo, 'id'>): Observable<Vehiculo> {
        return this.http.post<Vehiculo>(this.apiUrl, vehiculo);
    }

    /** Metodo para actualizar un vehiculo */
    updateVehiculo(vehiculo: Vehiculo): Observable<Vehiculo> {
        return this.http.put<Vehiculo>(
        `${this.apiUrl}/${vehiculo.id}`,
        vehiculo
        );
    }

    /** Metodo para eliminar un vehiculo */
    deleteVehiculo(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

}


