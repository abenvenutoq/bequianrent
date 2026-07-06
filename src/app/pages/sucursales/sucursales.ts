import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SucursalesService } from '../../services/sucursales.services';
import { Sucursales } from '../../models/modelos';


@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sucursales.html',
  styleUrl: './sucursales.css',
})
export class Sucursal implements OnInit {

  sucursales: Sucursales[] = [];

  cargando = true;

  mensajeError = '';

  private readonly cdr = inject(ChangeDetectorRef);

  constructor(private readonly sucursalesService: SucursalesService) {};

  ngOnInit(): void {
    this.cargarSucursales();
  }


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
