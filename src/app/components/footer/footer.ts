import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IndicadoresEconomicos } from '../../services/indicador-economico.service';

/**
 * @description
 * 
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'  
})

export class Footer implements OnInit {
  // Inyecciones modernas usando inject() o mantén tu constructor si lo prefieres
  private readonly IndicadoresEconomicos = inject(IndicadoresEconomicos);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly anio = new Date().getFullYear();
  valorDolar: number | null = null;
  fechaDolar = '';
  mensajeDolar = '';

  valorUf: number | null = null;
  fechaUf = '';
  mensajeUf = '';

  valorUtm: number | null = null;
  fechaUtm = '';
  mensajeUtm = '';

  ngOnInit(): void {
    this.cargarDolar();
    this.cargarUf();
    this.cargarUtm();
  }

  cargarDolar(): void {
    this.IndicadoresEconomicos.obtenerDolar().subscribe({
      next: (res) => {
        if (res && res.serie && res.serie.length > 0) {
          this.valorDolar = res.serie[0].valor;
          const fechaOriginal = new Date(res.serie[0].fecha);
          this.fechaDolar = fechaOriginal.toLocaleDateString('es-CL');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando API Dólar:', err);
        this.mensajeDolar = 'Dólar no disponible';
      }
    });
  }

  cargarUf(): void {
    this.IndicadoresEconomicos.obtenerUf().subscribe({
      next: (res) => {
        if (res && res.serie && res.serie.length > 0) {
          this.valorUf = res.serie[0].valor;
          const fechaOriginal = new Date(res.serie[0].fecha);
          this.fechaUf = fechaOriginal.toLocaleDateString('es-CL');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando API Dólar:', err);
        this.mensajeUf = 'UF no disponible';
      }
    });
  }

  cargarUtm(): void {
    this.IndicadoresEconomicos.obtenerUtm().subscribe({
      next: (res) => {
        if (res && res.serie && res.serie.length > 0) {
          this.valorUtm = res.serie[0].valor;
          const fechaOriginal = new Date(res.serie[0].fecha);
          this.fechaUtm = fechaOriginal.toLocaleDateString('es-CL');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando API Dólar:', err);
        this.mensajeUtm = 'UF no disponible';
      }
    });
  }
}