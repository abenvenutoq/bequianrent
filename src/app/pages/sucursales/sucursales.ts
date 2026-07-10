import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SucursalesService } from '../../services/sucursales.services';
import { Sucursales } from '../../models/modelos';

/**
 * @description
 * Componente que representa la página de sucursales.
 * Muestra una lista de sucursales obtenidas desde el servicio correspondiente.
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
   * Lista de sucursales obtenidas desde el servicio.
   * Se inicializa como un arreglo vacío y se llena al cargar los datos.
   */
  sucursales: Sucursales[] = [];
  cargando: boolean = true;
  mensajeError: string | null = null;

  constructor(private sucursalesService: SucursalesService) {}

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
   * Carga las sucursales desde el servicio y las almacena en la variable local.
   * Maneja errores en caso de que la carga falle.
   * Actualiza el estado de carga y el mensaje de error según corresponda.
   */
  cargarSucursales(): void {
    this.cargando = true;
    this.mensajeError = null;

    this.sucursalesService.obtenerSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar las sucursales:', err);
        this.mensajeError = 'No pudimos cargar la lista de sucursales en este momento. Por favor, intenta de nuevo más tarde.';
        this.cargando = false;
      }
    });
  }
}