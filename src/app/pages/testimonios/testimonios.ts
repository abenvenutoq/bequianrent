import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestimoniosService } from '../../services/testimonios.services';
import { Testimonios } from '../../models/modelos';

/**
 * @description
 * Componente Testimonio
 * Este componente se encarga de mostrar los testimonios de los clientes.
 */
@Component({
  selector: 'app-testimonios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonios.html',
  styleUrl: './testimonios.css',
})

/** 
 * @description
 * Clase del componente Testimonio
 */
export class Testimonio implements OnInit {

  testimonios: Testimonios[] = [];
  cargando = true;
  mensajeError = '';
  
  indexActivo = 0; 

  private readonly cdr = inject(ChangeDetectorRef);

  constructor(private readonly testimoniosService: TestimoniosService) { };

  ngOnInit(): void {
    this.cargarTestimonios();
  }

  /** @description Carga los testimonios desde el servicio */
  cargarTestimonios(): void {
    this.testimoniosService.obtenerTestimonios().subscribe({
      next: (datos) => {
        this.testimonios = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar las opiniones.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** @description Navega al testimonio anterior */
  anterior(): void {
    if (this.testimonios.length === 0) return;
    this.indexActivo = (this.indexActivo - 1 + this.testimonios.length) % this.testimonios.length;
    this.cdr.detectChanges();
  }

  /** @description Navega al testimonio siguiente */
  siguiente(): void {
    if (this.testimonios.length === 0) return;
    this.indexActivo = (this.indexActivo + 1) % this.testimonios.length;
    this.cdr.detectChanges();
  }

  /** @description Navega al testimonio en el índice especificado */
  irAlIndice(index: number): void {
    this.indexActivo = index;
    this.cdr.detectChanges();
  }
}