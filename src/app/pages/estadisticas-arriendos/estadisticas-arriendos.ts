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

/** 
 * @description
 * Clase AdminEstadisticaVenta
 * Este componente proporciona métodos y propiedades para mostrar estadísticas de ventas mensuales de arriendos.
 * Utiliza el servicio EstadisticaService para obtener los datos y mostrarlos en la interfaz de usuario.
 * Implementa la interfaz OnInit para cargar los datos al inicializar el componente.
 */
export class AdminEstadisticaVenta implements OnInit {

  arriendosMensuales: ArriendosMensuales[] = [];
  cargando = true;
  mensajeError = '';

  private readonly estadisticaService = inject(EstadisticaService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarArriendosMensuales();
  }

  /** @description Carga los arriendos mensuales del servicio */
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

  /** @description Obtiene el total de arriendos mensuales */
  get totalArriendos(): number {
    return this.arriendosMensuales.reduce(
      (total, item) => total + item.totalArriendos,
      0
    )
  }

  /** @description Obtiene el total de ingresos generados */
  get totalIngresos(): number {
    return this.arriendosMensuales.reduce(
      (total, item) => total + item.ingresosGenerados,
      0
    )
  }

  /** @description Obtiene el ingreso promedio por arriendo */
  get ingresoPromedio(): number {
    return this.totalIngresos / this.totalArriendos;
  }

}
