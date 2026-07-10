import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Sucursales } from '../models/modelos';

/**
 * @description
 * Servicio que maneja las operaciones relacionadas con las sucursales.
 * - Recupera datos desde LocalStorage o desde la API remota si no hay datos locales.
 * - Permite agregar, editar y eliminar sucursales.
 * - Persiste los cambios en LocalStorage para mantener el estado del navegador.
 */
@Injectable({
  providedIn: 'root'
})
export class SucursalesService {
  
    /** Instancia del cliente HTTP para realizar solicitudes HTTP */
    private http = inject(HttpClient);

    /** URL de la API en GitHub Pages */
    private readonly url = 'https://abenvenutoq.github.io/bequianrent-api/sucursales.json';
    /** Clave para almacenar los datos en LocalStorage */
    private readonly STORAGE_KEY = 'bequianrent_sucursales';

    constructor() { }

    /**
     * @description
     * Obtiene el listado de sucursales disponible en la aplicación.
     * - Si hay datos almacenados en LocalStorage, los devuelve inmediatamente.
     * - Si no hay datos locales, consulta la API remota y los guarda en LocalStorage.
     * @returns Observable<Sucursales[]> Flujo con el arreglo de sucursales cargado.
     */
    obtenerSucursales(): Observable<Sucursales[]> {
        const dataLocal = localStorage.getItem(this.STORAGE_KEY);

        if (dataLocal) {
            return of(JSON.parse(dataLocal));
        } else {
            return this.http.get<Sucursales[]>(this.url).pipe(
                tap(data => this.guardarLocalStorage(data)),
                catchError((error: HttpErrorResponse) => {
                    
                    console.error('Error HTTP Capturado en SucursalesServices:', error.message)

                    return throwError(() => new Error('No pudimos cargar la lista de sucursales en este momento. Por favor, intenta de nuevo más tarde.'));
                })
             );
        }
    }

    /**
     * @description
     * Agrega una nueva sucursal a la lista y la persiste en LocalStorage.
     * Calcula automáticamente el ID asignando el siguiente valor disponible.
     * @param nuevaSucursal La sucursal que se desea agregar.
     * @returns Observable<Sucursales[]> Flujo con la lista actualizada de sucursales.
     */
    agregarSucursal(nuevaSucursal: Sucursales): Observable<Sucursales[]> {
        const sucursales = this.leerLocalStorage();
        
        const nuevoId = sucursales.length > 0 ? Math.max(...sucursales.map(s => s.id)) + 1 : 1;
        nuevaSucursal.id = nuevoId;
        
        sucursales.push(nuevaSucursal);
        this.guardarLocalStorage(sucursales);
        
        return of(sucursales); 
    }

    /**
     * @description
     * Edita una sucursal existente en la lista local.
     * Busca la sucursal por su ID y actualiza sus datos, luego vuelve a persistir el arreglo.
     * @param sucursalModificada La sucursal con los datos actualizados.
     * @returns Observable<Sucursales[]> Flujo con la lista actualizada de sucursales.
     */
    editarSucursal(sucursalModificada: Sucursales): Observable<Sucursales[]> {
        const sucursales = this.leerLocalStorage();
        const index = sucursales.findIndex(s => s.id === sucursalModificada.id);
        
        if (index !== -1) {
        sucursales[index] = sucursalModificada;
        this.guardarLocalStorage(sucursales);
        }
        
        return of(sucursales);
    }

    /**
     * @description
     * Elimina una sucursal de la lista local por su ID y persiste el cambio.
     * @param id El ID de la sucursal que se desea eliminar.
     * @returns Observable<Sucursales[]> Flujo con la lista de sucursales después de la eliminación.
     */
    eliminarSucursal(id: number): Observable<Sucursales[]> {
        let sucursales = this.leerLocalStorage();
        sucursales = sucursales.filter(s => s.id !== id);
        this.guardarLocalStorage(sucursales);
        
        return of(sucursales);
    }
    
    /**
     * @description
     * Lee la lista de sucursales desde LocalStorage.
     * @returns Sucursales[] Lista de sucursales almacenadas en LocalStorage
     */
    private leerLocalStorage(): Sucursales[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    /**
     * @description
     * Guarda la lista de sucursales en LocalStorage.
     * @param sucursales La lista de sucursales que se desea guardar.
     * @returns void
     */
    private guardarLocalStorage(sucursales: Sucursales[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sucursales));
    }
}