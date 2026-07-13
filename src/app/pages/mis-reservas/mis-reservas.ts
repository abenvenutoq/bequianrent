import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { ReservaService } from '../../services/reservas.services';
import { VehiculosJsonServerService } from '../../services/vehiculos-json-server.services';
import { Reserva, Vehiculo } from '../../models/modelos';

/**
 * @description
 * Interfaz extendida que enriquece el modelo base de `Reserva`.
 * Permite incrustar el objeto completo del `Vehiculo` dentro de la reserva 
 * para facilitar su visualización en el HTML (marca, modelo, imagen, etc.) sin hacer múltiples consultas.
 */
interface ReservaDetalle extends Reserva {
  vehiculo?: Vehiculo;
}

/**
 * @description
 * Componente responsable de renderizar el historial personal de reservas del usuario activo.
 * * Funcionalidades principales:
 * - Protege la ruta verificando la sesión activa del usuario.
 * - Cruza información relacional (Reservas + Vehículos) en el lado del cliente.
 * - Implementa manejo de errores (`try-catch`) para evitar que el componente se rompa si un vehículo fue eliminado.
 */
@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-reservas.html',
  styleUrl: './mis-reservas.css',
})
export class MisReservas implements OnInit {
  /** Servicio para validar la sesión activa y obtener el correo del usuario. */
  private authService = inject(AuthService);
  /** Servicio para obtener el registro histórico global de reservas. */
  private reservaService = inject(ReservaService);
  /** Servicio para recuperar los datos específicos de los autos arrendados. */
  private vehiculoService = inject(VehiculosJsonServerService);
  /** Servicio de enrutamiento para expulsar a usuarios no autenticados. */
  private router = inject(Router);
  /** Servicio para forzar la detección de cambios en la vista cuando se actualizan las reservas. */
  private cdr = inject(ChangeDetectorRef);

  /** * Colección de reservas filtradas y enriquecidas con los datos de los vehículos. 
   * Se utiliza directamente en el HTML para iterar las tarjetas o filas.
   */
  misReservas: ReservaDetalle[] = [];
  /** Bandera booleana que controla la visualización de un spinner o estado de carga en la UI. */
  cargando = true;

  /**
   * Ciclo de vida inicial del componente.
   * 1. Bloquea la ejecución en entornos de servidor (SSR).
   * 2. Comprueba de forma síncrona la existencia de una sesión válida.
   * 3. Invoca la carga de reservas utilizando el correo del usuario y gestiona el estado visual de "cargando".
   */
  ngOnInit(): void {
    if (!this.authService.isBrowser()) return;

    const sesion = this.authService.obtenerSesion();
    if (!sesion || !sesion.loged) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarReservas(sesion.correo);
  }

  /**
   * Obtiene, filtra y procesa las reservas que le pertenecen exclusivamente al usuario logueado.
   * * Lógica aplicada:
   * - Normaliza el correo (minúsculas y sin espacios) para garantizar una comparación exacta.
   * - Filtra el arreglo global de reservas basándose en el correo.
   * - Mapea los resultados cruzando el `idVehiculo` con la base de datos de autos para inyectar la información gráfica del auto.
   * * @param {string} correoUsuario El correo electrónico extraído de la sesión activa actual.
   */
  cargarReservas(correoUsuario: string): void {
    if (!correoUsuario) {
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    // Normalización de seguridad para evitar fallos por mayúsculas accidentales o espacios al final
    const correoLimpio = correoUsuario.trim().toLowerCase();

    const todasLasReservas = this.reservaService.obtenerReservas() || [];
    
    // Extraemos solo las reservas del usuario actual
    const reservasUsuario = todasLasReservas.filter(r => {
      return r && r.correo && r.correo.trim().toLowerCase() === correoLimpio;
    });

    this.vehiculoService.getVehiculo().subscribe({
      next: (vehiculos) => {
        // Enriquecemos la data combinando cada reserva con los detalles de su vehículo
        this.misReservas = reservasUsuario.map(reserva => {
          const vehiculoEncontrado = vehiculos.find(v => Number(v.id) === Number(reserva.idVehiculo));

          return {
            ...reserva,
            vehiculo: vehiculoEncontrado
          };
        });

        // Ordena las reservas por fecha.
        this.misReservas.sort((a, b) => {
          const fechaA = a.fechaDesde ? new Date(a.fechaDesde).getTime() : 0;
          const fechaB = b.fechaDesde ? new Date(b.fechaDesde).getTime() : 0;
          return fechaB - fechaA;
        });

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando vehículos para enriquecer reservas:', error);
        this.misReservas = reservasUsuario.map(reserva => ({ ...reserva }));
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}