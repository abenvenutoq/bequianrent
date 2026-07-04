import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EstadisticaService } from '../../services/estadisticas';
import { ArriendosMensuales } from '../../models/modelos';

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

  ngOnInit(): void {
    this.cargarVentasMensuales();
  }

  cargarVentasMensuales(): void {

    this.estadisticaService.obtenerVentasMensuales().subscribe({
      next: (datos) => {
        this.arriendosMensuales = datos.reverse();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar las ventas mensuales.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });

  }

  get totalArriendos(): number {
    return this.arriendosMensuales.reduce(
      (total, item) => total + item.totalArriendos,
      0
    )
  }

  get totalIngresos(): number {
    return this.arriendosMensuales.reduce(
      (total, item) => total + item.ingresosGenerados,
      0
    )
  }

}
