import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SucursalesService } from '../../services/sucursales.services';
import { Sucursales } from '../../models/modelos';

/**
 * @description
 * Componente que representa la página de sucursales.
 * Gestiona la visualización de la lista de sucursales y el estado de carga.
 * Utiliza el servicio `SucursalesService` para obtener los datos y manejar errores.
 */
@Component({
  selector: 'Sucursales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sucursales.html',
  styleUrls: ['./sucursales.css']
})
export class SucursalesComponent implements OnInit {
  
  /**
   * @description
   * Arreglo de sucursales recibidas desde el servicio.
   * Se actualiza cuando la carga de datos finaliza correctamente.
   */
  sucursales: Sucursales[] = [];

  /**
   * @description
   * Indicador de estado de carga.
   * Se utiliza para mostrar spinner o mensajes de progreso en la vista.
   */
  cargando: boolean = true;

  /**
   * @description
   * Mensaje de error que se muestra cuando falla la carga de sucursales.
   * Está en `null` cuando no existe error.
   */
  mensajeError: string | null = null;

  constructor(
    private sucursalesService: SucursalesService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * @description
   * Método que se ejecuta al inicializar el componente.
   * Llama a la función para cargar las sucursales desde el servicio.
   */
  ngOnInit(): void {
    this.cargarSucursales();
  }

  /**
   * @description
   * Solicita la lista de sucursales al servicio y actualiza el estado interno.
   * - Muestra el indicador de carga mientras la petición está en curso.
   * - Almacena los datos recibidos en `sucursales`.
   * - Captura y guarda el error en `mensajeError` si la petición falla.
   * @returns {void}
   */
  cargarSucursales(): void {
    this.cargando = true;
    this.mensajeError = null;

    this.sucursalesService.obtenerSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.mensajeError = err.message;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}