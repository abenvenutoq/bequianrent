import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Testimonios } from '../models/modelos';

/**
 * @description
 * Servicio para obtener información de testimonios.
 * Este servicio utiliza HttpClient para realizar solicitudes HTTP y obtener datos de testimonios desde un archivo JSON.
 */
@Injectable({
    providedIn: 'root'
})

/**
 * @description
 * Clase TestimoniosService
 * Este servicio proporciona métodos para obtener información de testimonios desde un archivo JSON.
 * Utiliza HttpClient para realizar solicitudes HTTP y devuelve un Observable con los datos de los testimonios.
 */
export class TestimoniosService {

    private readonly urlTestimonios = 'https://abenvenutoq.github.io/bequianrent-api/testimonios.json';

    constructor(private readonly http: HttpClient){}

    obtenerTestimonios(): Observable<Testimonios[]> {
        return this.http.get<Testimonios[]>(this.urlTestimonios);
    }

}
