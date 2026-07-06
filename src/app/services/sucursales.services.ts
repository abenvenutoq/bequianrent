import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Sucursales } from '../models/modelos';

/**
 * @description
 * Servicio para obtener información de sucursales.
 * Este servicio utiliza HttpClient para realizar solicitudes HTTP y obtener datos de sucursales desde un archivo JSON.
 */
@Injectable({
    providedIn: 'root'
})

/**
 * @description
 * Clase SucursalesService
 * Este servicio proporciona métodos para obtener información de sucursales desde un archivo JSON.
 * Utiliza HttpClient para realizar solicitudes HTTP y devuelve un Observable con los datos de las sucursales.
 */
export class SucursalesService {

    private readonly urlSucursales = 'https://abenvenutoq.github.io/bequianrent-api/sucursales.json';

    constructor(private readonly http: HttpClient){}

    obtenerSucursales(): Observable<Sucursales[]> {
      return this.http.get<Sucursales[]>(this.urlSucursales);
    }

}
