import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SucursalesService } from '../../services/sucursales.services';
import { Sucursales } from '../../models/modelos';

/**
 * @description
 * Componente Sucursal
 * Este componente se encarga de mostrar la información de las sucursales.
 * Utiliza el servicio SucursalesService para obtener los datos y mostrarlos en la interfaz de usuario.
 * Implementa la interfaz OnInit para cargar los datos al inicializar el componente.
 */
@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sucursales.html',
  styleUrl: './sucursales.css',
})

/** @description Componente para gestionar la visualización de sucursales */
export class Sucursal implements OnInit {

  sucursales: Sucursales[] = [];

  cargando = true;

  mensajeError = '';

  private readonly cdr = inject(ChangeDetectorRef);

  constructor(private readonly sucursalesService: SucursalesService) {};

  ngOnInit(): void {
    this.cargarSucursales();
  }

  /** @description Carga las sucursales desde el servicio */
  cargarSucursales(): void {
    this.sucursalesService.obtenerSucursales().subscribe({
      next: (datos) => {
        this.sucursales = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar las sucursales.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
