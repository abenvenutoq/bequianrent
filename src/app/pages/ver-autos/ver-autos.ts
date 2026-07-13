import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Importamos tu servicio de JSON Server y la interfaz
import { VehiculosJsonServerService } from '../../services/vehiculos-json-server.services';
import { Vehiculo } from '../../models/modelos';

/**
 * @description
 * Componente encargado de renderizar el catálogo público de la flota de vehículos.
 * * Funcionalidades principales:
 * - Se conecta al `VehiculosJsonServerService` para recuperar el inventario desde la API.
 * - Implementa un motor de búsqueda/filtrado múltiple en tiempo real usando el módulo `FormsModule` (`[(ngModel)]`).
 * - Protege los datos originales utilizando una propiedad computada (Getter) para mostrar los resultados 
 * filtrados sin mutar ni alterar la base de datos principal de la vista.
 */
@Component({
  selector: 'app-ver-autos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ver-autos.html',
  styleUrl: './ver-autos.css',
})
export class VerAutos implements OnInit {
  
  /** Servicio inyectado para acceder a los datos de la flota en la API. */
  private vehiculosService = inject(VehiculosJsonServerService);
  /** Inyectamos ChangeDetectorRef para actualizar la vista tras la llamada asíncrona. */
  private cdr = inject(ChangeDetectorRef);
  /** Inyectamos PLATFORM_ID para saber si estamos en el navegador o en el servidor (SSR) */
  private platformId = inject(PLATFORM_ID);

  /** 
   * Colección base que almacena todos los vehículos de forma intacta. 
   * Ahora se inicializa como un arreglo vacío y se llena mediante la API.
   */
  vehiculo: Vehiculo[] = [];

  // Variables para controlar el estado de la vista
  cargando: boolean = true;
  mensajeError: string | null = null;

  /** Modelo de datos bidireccional para el filtro de Marca (ej. 'Kia', 'Toyota'). */
  filtroMarca: string = '';
  /** Modelo de datos bidireccional para el filtro de Modelo (ej. 'Corolla', 'Yaris'). */
  filtroModelo: string = '';
  /** Modelo de datos bidireccional para el filtro por Año de fabricación. */
  filtroAnio: string = '';
  /** Modelo de datos bidireccional para el estado del auto ('true' = Disponible, 'false' = Ocupado). */
  filtroDisponible: string = '';

  ngOnInit(): void {
    // Solo disparamos la petición a la API si estamos en el navegador.
    // Esto evita que el Server-Side Rendering (SSR) se quede colgado esperando a JSON Server.
    if (isPlatformBrowser(this.platformId)) {
      this.cargarCatalogo();
    }
  }

  /**
   * Obtiene la lista de vehículos desde JSON Server.
   */
  cargarCatalogo(): void {
    this.cargando = true;
    this.mensajeError = null;

    this.vehiculosService.getVehiculo().subscribe({
      next: (data) => {
        this.vehiculo = data;
        this.cargando = false;
        this.cdr.detectChanges(); // Le avisamos a Angular que los datos llegaron
      },
      error: (err: Error) => {
        this.mensajeError = 'Ocurrió un error al cargar el catálogo de vehículos.';
        this.cargando = false;
        console.error('Error JSON Server:', err);
        this.cdr.detectChanges(); // Le avisamos a Angular para que muestre el error
      }
    });
  }

  /**
   * Propiedad computada (Getter) que procesa y retorna los vehículos en pantalla según los filtros activos.
   * * Lógica de evaluación:
   * - Si un filtro está vacío (string `''`), la condición se asume como válida (`true`), ignorando esa restricción.
   * - Cada vehículo debe cumplir con las 3 condiciones de forma simultánea (`cumpleMarca && cumpleAnio && cumpleDisp`).
   * @returns Un sub-arreglo filtrado dinámicamente con los vehículos que coinciden con la búsqueda.
   */
  get listaFiltrada() {
    return this.vehiculo.filter(auto => {
      const cumpleMarca = this.filtroMarca === '' || auto.marca === this.filtroMarca;
      const cumpleModelo = this.filtroModelo === '' || auto.modelo === this.filtroModelo;
      const cumpleAnio = this.filtroAnio === '' || auto.anio.toString() === this.filtroAnio;

      let cumpleDisp = true;
      // Convertimos el string a boolean según tu lógica
      if (this.filtroDisponible === 'true') cumpleDisp = auto.disponible === true;
      if (this.filtroDisponible === 'false') cumpleDisp = auto.disponible === false;

      return cumpleMarca && cumpleModelo && cumpleAnio && cumpleDisp;
    });
  }

  /** Lista única y ordenada de marcas disponibles desde JSON Server. */
  get marcasDisponibles(): string[] {
    return [...new Set(this.vehiculo.map(auto => auto.marca))].sort((a, b) => a.localeCompare(b));
  }

  /** Lista única y ordenada de modelos disponibles desde JSON Server. */
  get modelosDisponibles(): string[] {
    return [...new Set(this.vehiculo.map(auto => auto.modelo))].sort((a, b) => a.localeCompare(b));
  }

  /** Lista única y ordenada de años disponibles desde JSON Server. */
  get aniosDisponibles(): number[] {
    return [...new Set(this.vehiculo.map(auto => auto.anio))].sort((a, b) => a - b);
  }

  /**
   * Resetea el motor de búsqueda a su estado por defecto.
   * Al vaciar los strings de los filtros, la reactividad de Angular gatilla automáticamente 
   * el getter `listaFiltrada`, volviendo a renderizar el inventario completo.
   */
  limpiarFiltros() {
    this.filtroMarca = '';
    this.filtroModelo = '';
    this.filtroAnio = '';
    this.filtroDisponible = '';
  }

}