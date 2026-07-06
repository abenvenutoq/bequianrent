import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ArriendosMensuales } from '../models/modelos';

@Injectable({
    providedIn: 'root'
})
export class EstadisticaService {
    private readonly ulrVentasMensuales = '/data/arriendos_mensuales.json'

    constructor(private readonly http: HttpClient) {}

    obtenerVentasMensuales(): Observable<ArriendosMensuales[]> {
        return this.http.get<ArriendosMensuales[]>(this.ulrVentasMensuales);
    }
    
}
