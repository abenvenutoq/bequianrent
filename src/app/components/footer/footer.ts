import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IndicadoresEconomicos } from '../../services/indicador-economico.service';

/**
 * @description
 * Componente Footer
 * Este componente representa el pie de página de la aplicación.
 * Muestra información económica relevante, como el valor del Dólar, UF y UTM.
 * Utiliza el servicio {@link IndicadoresEconomicos} para obtener los datos desde una API externa.
 * Implementa la interfaz OnInit para cargar los datos al inicializar el componente.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'  
})


export class Footer implements OnInit {
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

  /**
   * @description
   * Carga el valor del Dólar desde la API externa utilizando el servicio {@link IndicadoresEconomicos}.
   * Actualiza las propiedades `valorDolar` y `fechaDolar` con los datos obtenidos.
   * Maneja errores en caso de que la API no esté disponible, mostrando un mensaje de error.
   */
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

  /**
   * @description
   * Carga el valor de la UF desde la API externa utilizando el servicio {@link IndicadoresEconomicos}.
   * Actualiza las propiedades `valorUf` y `fechaUf` con los datos obtenidos.
   * Maneja errores en caso de que la API no esté disponible, mostrando un mensaje de error.
   */
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
        console.error('Error cargando API UF:', err);
        this.mensajeUf = 'UF no disponible';
      }
    });
  }

  /**
   * @description
   * Carga el valor de la UTM desde la API externa utilizando el servicio {@link IndicadoresEconomicos}.
   * Actualiza las propiedades `valorUtm` y `fechaUtm` con los datos obtenidos.
   * Maneja errores en caso de que la API no esté disponible, mostrando un mensaje de error.
   */
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
        console.error('Error cargando API UTM:', err);
        this.mensajeUtm = 'UTM no disponible';
      }
    });
  }
}