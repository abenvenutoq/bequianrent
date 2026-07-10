import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Sucursales } from '../models/modelos';

/**
 * @description
 * Servicio que maneja las operaciones relacionadas con las sucursales.
 * Permite obtener, agregar, editar y eliminar sucursales.
 * Utiliza LocalStorage para simular un backend y persistir los datos.
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
     * Obtiene la lista de sucursales.
     * Primero intenta obtener los datos desde LocalStorage.
     * Si no existen, realiza una solicitud HTTP a la API y guarda los datos en LocalStorage.
     * @returns Observable<Sucursales[]> Lista de sucursales
     */
    obtenerSucursales(): Observable<Sucursales[]> {
        const dataLocal = localStorage.getItem(this.STORAGE_KEY);

        if (dataLocal) {
            return of(JSON.parse(dataLocal));
        } else {
            return this.http.get<Sucursales[]>(this.url).pipe(
            tap(data => this.guardarLocalStorage(data))
            );
        }
    }

    /**
     * @description
     * Agrega una nueva sucursal a la lista.
     * Genera un ID automático basado en el ID más alto existente.
     * Guarda la lista actualizada en LocalStorage.
     * @param nuevaSucursal La sucursal que se desea agregar.
     * @returns Observable<Sucursales[]> Lista actualizada de sucursales
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
     * Edita una sucursal existente en la lista.
     * Busca la sucursal por ID y actualiza sus datos.
     * Guarda la lista actualizada en LocalStorage.
     * @param sucursalModificada La sucursal con los datos actualizados.
     * @returns Observable<Sucursales[]> Lista actualizada de sucursales
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
     * Elimina una sucursal de la lista.
     * Filtra la lista para excluir la sucursal con el ID especificado.
     * Guarda la lista actualizada en LocalStorage.
     * @param id El ID de la sucursal que se desea eliminar.
     * @returns Observable<Sucursales[]> Lista actualizada de sucursales
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