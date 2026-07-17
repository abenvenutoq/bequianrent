import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EstadisticaService } from '../../services/estadisticas.services';
import { ArriendosMensuales } from '../../models/modelos';

/**
 * @description
 * Componente AdminEstadisticaVenta
 * Este componente se encarga de mostrar las estadísticas de ventas mensuales de arriendos.
 * Utiliza el servicio EstadisticaService para obtener los datos y mostrarlos en la interfaz de usuario.
 * Implementa la interfaz OnInit para cargar los datos al inicializar el componente.
 */
@Component({
  selector: 'app-estadisticas-ventas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas-arriendos.html',
  styleUrl: './estadisticas-arriendos.css',
})

export class AdminEstadisticaVenta implements OnInit {

  arriendosMensuales: ArriendosMensuales[] = [];
  cargando = true;
  mensajeError = '';

  private readonly estadisticaService = inject(EstadisticaService);
  private readonly cdr = inject(ChangeDetectorRef);

  /**
   * @description
   * Método ngOnInit
   * Este método se ejecuta al inicializar el componente y llama a la función cargarArriendosMensuales para obtener los datos de arriendos mensuales.
   */
  ngOnInit(): void {
    this.cargarArriendosMensuales();
  }

  /**
   * @description
   * Método cargarArriendosMensuales
   * Este método utiliza el servicio EstadisticaService para obtener los datos de arriendos mensuales.
   * Si la solicitud es exitosa, se almacenan los datos en la propiedad arriendosMensuales y se actualiza la vista.
   * Si ocurre un error, se muestra un mensaje de error y se actualiza la vista.
   */
  cargarArriendosMensuales(): void {

    this.estadisticaService.obtenerArriendosMensuales().subscribe({
      next: (datos) => {
        this.arriendosMensuales = datos.reverse();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar los detalles de arriendos mensuales.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });

  }

  /**
   * @description
   * Método totalArriendos
   * Este método calcula el total de arriendos sumando la propiedad totalArriendos de cada elemento en el arreglo arriendosMensuales.
   * @returns {number} El total de arriendos.
   */
  get totalArriendos(): number {
    return this.arriendosMensuales.reduce(
      (total, item) => total + item.totalArriendos,
      0
    )
  }

  /**
   * @description
   * Método totalIngresos
   * Este método calcula el total de ingresos generados sumando la propiedad ingresosGenerados de cada elemento en el arreglo arriendosMensuales.
   * @returns {number} El total de ingresos generados.
   */
  get totalIngresos(): number {
    return this.arriendosMensuales.reduce(
      (total, item) => total + item.ingresosGenerados,
      0
    )
  }

  /**
   * @description
   * Método ingresoPromedio
   * Este método calcula el ingreso promedio dividiendo el total de ingresos generados entre el total de arriendos.
   * @returns {number} El ingreso promedio por arriendo.
   */
  get ingresoPromedio(): number {
    return this.totalIngresos / this.totalArriendos;
  }

}
