import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestimoniosService } from '../../services/testimonios.services';
import { Testimonios } from '../../models/modelos';

@Component({
  selector: 'app-testimonios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonios.html',
  styleUrl: './testimonios.css',
})
export class Testimonio implements OnInit {

  testimonios: Testimonios[] = [];
  cargando = true;
  mensajeError = '';
  
  // ---> NUEVA VARIABLE: Guarda el índice del testimonio central
  indexActivo = 0; 

  private readonly cdr = inject(ChangeDetectorRef);

  constructor(private readonly testimoniosService: TestimoniosService) { };

  ngOnInit(): void {
    this.cargarTestimonios();
  }

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

  // ---> NUEVOS MÉTODOS: Navegación cíclica del carrusel
  anterior(): void {
    if (this.testimonios.length === 0) return;
    this.indexActivo = (this.indexActivo - 1 + this.testimonios.length) % this.testimonios.length;
    this.cdr.detectChanges();
  }

  siguiente(): void {
    if (this.testimonios.length === 0) return;
    this.indexActivo = (this.indexActivo + 1) % this.testimonios.length;
    this.cdr.detectChanges();
  }

  irAlIndice(index: number): void {
    this.indexActivo = index;
    this.cdr.detectChanges();
  }
}