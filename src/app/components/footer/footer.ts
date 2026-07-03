import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TipoCambioService } from '../../services/cambio-dolar.service';

@Component({
  selector: 'app-footer',
  standalone: true, // Asegúrate de mantenerlo si es standalone
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'  
})
export class Footer implements OnInit, OnDestroy {
  // Inyecciones modernas usando inject() o mantén tu constructor si lo prefieres
  private readonly tipoCambioService = inject(TipoCambioService);

  readonly anio = new Date().getFullYear();
  valorDolar: number | null = null;
  fechaDolar = '';
  mensajeDolar = '';

  // Propiedades para los relojes internacionales
  relojChile = '';
  relojNuevaYork = '';
  relojMadrid = '';
  private timerId: any; // Guardará la referencia del intervalo para limpiarlo

  ngOnInit(): void {
    this.cargarDolar();
    this.iniciarRelojesMundiales();
  }

  /**
   * Al destruir el componente, limpiamos el intervalo en memoria 
   * para evitar fugas de rendimiento (Memory Leaks).
   */
  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  cargarDolar(): void {
    this.tipoCambioService.obtenerDolar().subscribe({
      next: (res) => {
        if (res && res.serie && res.serie.length > 0) {
          this.valorDolar = res.serie[0].valor;
          const fechaOriginal = new Date(res.serie[0].fecha);
          this.fechaDolar = fechaOriginal.toLocaleDateString('es-CL');
        }
      },
      error: (err) => {
        console.error('Error cargando API Dólar:', err);
        this.mensajeDolar = 'Dólar no disponible';
      }
    });
  }

  /**
   * Ejecuta un bucle cada 1 segundo para calcular la hora exacta
   * en distintas zonas geográficas usando el estándar internacional de JS.
   */
  iniciarRelojesMundiales(): void {
    const actualizarHoras = () => {
      const ahora = new Date();
      
      // Opciones de formateo: Reloj de 24 horas con segundos
      const opciones: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };

      // Calculamos las horas según su identificador IANA de Zona Horaria
      this.relojChile = ahora.toLocaleTimeString('es-CL', { ...opciones, timeZone: 'America/Santiago' });
      this.relojNuevaYork = ahora.toLocaleTimeString('en-US', { ...opciones, timeZone: 'America/New_York' });
      this.relojMadrid = ahora.toLocaleTimeString('es-ES', { ...opciones, timeZone: 'Europe/Madrid' });
    };

    actualizarHoras(); // Primera ejecución inmediata
    this.timerId = setInterval(actualizarHoras, 1000); // Bucle cada 1 segundo
  }
}