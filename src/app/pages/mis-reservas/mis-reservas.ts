import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.services.';
import { ReservaService } from '../../services/reservas.services';
import { VehiculoService } from '../../services/vehiculos.services';
import { Reserva, Vehiculo } from '../../models/modelos';

interface ReservaDetalle extends Reserva {
  vehiculo?: Vehiculo;
}

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-reservas.html',
  styleUrl: './mis-reservas.css',
})
export class MisReservas implements OnInit {
  private authService = inject(AuthService);
  private reservaService = inject(ReservaService);
  private vehiculoService = inject(VehiculoService);
  private router = inject(Router);

  misReservas: ReservaDetalle[] = [];
  cargando = true;

  ngOnInit(): void {
    if (!this.authService.isBrowser()) return;

    const sesion = this.authService.obtenerSesion();
    if (!sesion || !sesion.loged) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      this.cargarReservas(sesion.correo);
    } catch (error) {
      console.error("Error crítico cargando reservas:", error);
    } finally {
      this.cargando = false;
    }
  }

  cargarReservas(correoUsuario: string): void {
    if (!correoUsuario) return;

    const correoLimpio = correoUsuario.trim().toLowerCase();

    const todasLasReservas = this.reservaService.obtenerReservas() || [];
    
    const reservasUsuario = todasLasReservas.filter(r => {
      return r && r.correo && r.correo.trim().toLowerCase() === correoLimpio;
    });

    this.misReservas = reservasUsuario.map(reserva => {
      let vehiculoEncontrado: Vehiculo | undefined;
      
      try {
        vehiculoEncontrado = this.vehiculoService.getVehiculosPorId(reserva.idVehiculo);
      } catch (e) {
        console.warn(`No se pudo cargar el vehículo con ID ${reserva.idVehiculo}`, e);
      }

      return {
        ...reserva,
        vehiculo: vehiculoEncontrado
      };
    });

    this.misReservas.sort((a, b) => {
      const fechaA = a.fechaDesde ? new Date(a.fechaDesde).getTime() : 0;
      const fechaB = b.fechaDesde ? new Date(b.fechaDesde).getTime() : 0;
      return fechaB - fechaA;
    });
  }
}