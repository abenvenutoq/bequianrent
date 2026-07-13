import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.services';
import { ReservaService } from '../../services/reservas.services';
import { VehiculosJsonServerService } from '../../services/vehiculos-json-server.services';
import { Usuario, Reserva, Vehiculo } from '../../models/modelos';

/**
 * @description
 * Componente que representa el panel de administración.
 * Permite cambiar entre las vistas de usuarios y reservas.
 */
import { UsuariosTablaComponent } from './components/usuarios-tabla/usuarios-tabla';
import { ReservasTablaComponent } from './components/reservas-tabla/reservas-tabla';

/**
 * @description
 * Clase que implementa la lógica del componente AdminPanel.
 * Se encarga de manejar la vista actual y actualizar los datos de usuarios, reservas y vehículos.
 */
@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, UsuariosTablaComponent, ReservasTablaComponent], 
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})

/**
 * @description
 * Clase que implementa la lógica del componente AdminPanel.
 * Se encarga de manejar la vista actual y actualizar los datos de usuarios, reservas y vehículos.
 */
export class AdminPanel implements OnInit {
  private authService = inject(AuthService);
  private reservaService = inject(ReservaService);
  private vehiculoService = inject(VehiculosJsonServerService);


  /** 
   * @description
   * Variable que almacena la vista actual del panel de administración.
    * Puede ser 'usuarios' o 'reservas'.
   */
  vistaActual: 'usuarios' | 'reservas' = 'usuarios';
  usuarios: Usuario[] = [];
  reservas: Reserva[] = [];
  vehiculos: Vehiculo[] = [];

  /**
   * @description
   * Método que se ejecuta al inicializar el componente.
   * Carga los datos de usuarios, reservas y vehículos desde los servicios correspondientes.
   */
  ngOnInit(): void {
    // Carga inicial de datos
    this.usuarios = this.authService.obtenerUsuario() || [];
    this.reservas = this.reservaService.obtenerReservas() || [];

    this.cargarVehiculos();
  }

  private cargarVehiculos(): void {
    this.vehiculoService.getVehiculo().subscribe({
      next: (vehiculos) => {
        this.vehiculos = vehiculos;
      },
      error: () => {
        this.vehiculos = [];
      }
    });
  }

  /**
   * @description
   * Método que cambia la vista actual del panel de administración.
    * @param vista La vista a la que se desea cambiar ('usuarios' o 'reservas').
   */
  cambiarVista(vista: 'usuarios' | 'reservas'): void {
    this.vistaActual = vista;
  }

  /**
   * @description
   * Método que actualiza el estado de una reserva.
   * Emite un evento con la reserva y el nuevo estado.
   * @param evento Objeto que contiene la reserva y el nuevo estado.
   */
  async actualizarEstadoReserva(evento: {reserva: Reserva, nuevoEstado: string}): Promise<void> {
    const { reserva, nuevoEstado } = evento;
    const estadoAnterior = reserva.estado;

    if (estadoAnterior === nuevoEstado) {
      return;
    }

    reserva.estado = nuevoEstado;
    this.reservaService.guardarReservas(this.reservas);

    const seLibera = nuevoEstado === 'Completada' || nuevoEstado === 'Cancelada';
    const estabaLiberada = estadoAnterior === 'Completada' || estadoAnterior === 'Cancelada';

    if (seLibera === estabaLiberada) {
      return;
    }

    const auto = this.vehiculos.find(v => Number(v.id) === Number(reserva.idVehiculo));
    if (!auto) {
      return;
    }

    const disponibilidadNueva = seLibera;
    if (auto.disponible === disponibilidadNueva) {
      return;
    }

    auto.disponible = disponibilidadNueva;

    try {
      await firstValueFrom(this.vehiculoService.updateVehiculo(auto));
    } catch {
      auto.disponible = !disponibilidadNueva;
      reserva.estado = estadoAnterior;
      this.reservaService.guardarReservas(this.reservas);
    }
  }
}