import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IndicadorEconomico } from '../models/modelos';

/**
 * @description
 * Servicio que proporciona métodos para obtener información del tipo de cambio del dólar observado.
 * Utiliza la API pública de mindicador.cl para obtener los datos.
 */
@Injectable({
  providedIn: 'root'
})
export class TipoCambioService {

    /**
     * @description
     * URL de la API para obtener el tipo de cambio del dólar observado.
     */
    private readonly urlDolar = 'https://mindicador.cl/api/dolar';

    constructor(private readonly http: HttpClient) {}

    /**
     * @description
     * Obtiene el tipo de cambio del dólar observado desde la API.
     * @returns {Observable<IndicadorEconomico>} Un observable que emite los datos del tipo de cambio del dólar.
     */
    obtenerDolar(): Observable<IndicadorEconomico> {
    return this.http.get<IndicadorEconomico>(this.urlDolar);
    }
}