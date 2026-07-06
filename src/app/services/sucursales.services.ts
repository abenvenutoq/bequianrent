import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Sucursales } from '../models/modelos';

@Injectable({
    providedIn: 'root'
})

export class SucursalesService {

    private readonly urlSucursales = 'https://abenvenutoq.github.io/bequianrent-api/sucursales.json';

    constructor(private readonly http: HttpClient){}

    obtenerSucursales(): Observable<Sucursales[]> {
      return this.http.get<Sucursales[]>(this.urlSucursales);
    }

}
