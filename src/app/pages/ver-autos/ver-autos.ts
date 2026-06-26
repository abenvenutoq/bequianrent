import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VehiculoService } from '../../services/vehiculos.services';

/**
 * @description
 * Componente encargado de renderizar el catálogo público de la flota de vehículos.
 * * Funcionalidades principales:
 * - Se conecta al `VehiculoService` para recuperar el inventario persistido.
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
export class VerAutos {
  /** Servicio inyectado para acceder a los datos de la flota en el almacenamiento. */
  private vehiculos = inject(VehiculoService);

  /** * Colección base que almacena todos los vehículos de forma intacta. 
   * Se inicializa inmediatamente al instanciar el componente.
   */
  vehiculo = this.vehiculos.getVehiculos();

  /** Modelo de datos bidireccional para el filtro de Marca (ej. 'Kia', 'Toyota'). */
  filtroMarca: string = '';
  /** Modelo de datos bidireccional para el filtro por Año de fabricación. */
  filtroAnio: string = '';
  /** Modelo de datos bidireccional para el estado del auto ('true' = Disponible, 'false' = Ocupado). */
  filtroDisponible: string = '';


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
      const cumpleAnio = this.filtroAnio === '' || auto.anio.toString() === this.filtroAnio;

      let cumpleDisp = true;
      if (this.filtroDisponible === 'true') cumpleDisp = auto.disponible === true;
      if (this.filtroDisponible === 'false') cumpleDisp = auto.disponible === false;

      return cumpleMarca && cumpleAnio && cumpleDisp;
    });
  }

  /**
   * Resetea el motor de búsqueda a su estado por defecto.
   * Al vaciar los strings de los filtros, la reactividad de Angular gatilla automáticamente 
   * el getter `listaFiltrada`, volviendo a renderizar el inventario completo.
   */
  limpiarFiltros() {
    this.filtroMarca = '';
    this.filtroAnio = '';
    this.filtroDisponible = '';
  }

}