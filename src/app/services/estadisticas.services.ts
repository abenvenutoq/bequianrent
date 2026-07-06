import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ArriendosMensuales } from '../models/modelos';

/**
 * @description
 * Servicio para obtener estadísticas de ventas mensuales.
 * Este servicio utiliza HttpClient para realizar solicitudes HTTP y obtener datos de ventas mensuales desde un archivo JSON.
 */
@Injectable({
    providedIn: 'root'
})

/**
 * @description
 * Clase EstadisticaService
 * Este servicio proporciona métodos para obtener estadísticas de ventas mensuales desde un archivo JSON.
 * Utiliza HttpClient para realizar solicitudes HTTP y devuelve un Observable con los datos de ventas mensuales.
 */
export class EstadisticaService {
    private readonly ulrVentasMensuales = '/data/arriendos_mensuales.json'

    constructor(private readonly http: HttpClient) {}

    obtenerVentasMensuales(): Observable<ArriendosMensuales[]> {
        return this.http.get<ArriendosMensuales[]>(this.ulrVentasMensuales);
    }
    
}
