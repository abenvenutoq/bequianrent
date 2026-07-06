import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Testimonios } from '../models/modelos';

@Injectable({
    providedIn: 'root'
})

export class TestimoniosService {

    private readonly urlTestimonios = 'https://abenvenutoq.github.io/bequianrent-api/testimonios.json';

    constructor(private readonly http: HttpClient){}

    obtenerTestimonios(): Observable<Testimonios[]> {
        return this.http.get<Testimonios[]>(this.urlTestimonios);
    }

}
