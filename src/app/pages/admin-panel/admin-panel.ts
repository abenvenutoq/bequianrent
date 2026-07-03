import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { ReservaService } from '../../services/reservas.services';
import { VehiculoService } from '../../services/vehiculos.services';
import { Usuario, Reserva, Vehiculo } from '../../models/modelos';

/**
 * @description
 * Componente que representa el panel de administración.
 * Permite cambiar entre las vistas de usuarios, reservas y vehículos.
 */
import { UsuariosTablaComponent } from './components/usuarios-tabla/usuarios-tabla';
import { ReservasTablaComponent } from './components/reservas-tabla/reservas-tabla';
import { VehiculosTablaComponent } from './components/vehiculos-tabla/vehiculos-tabla';

/**
 * @description
 * Clase que implementa la lógica del componente AdminPanel.
 * Se encarga de manejar la vista actual y actualizar los datos de usuarios, reservas y vehículos.
 */
@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, UsuariosTablaComponent, ReservasTablaComponent, VehiculosTablaComponent], 
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
  private vehiculoService = inject(VehiculoService);


  /** 
   * @description
   * Variable que almacena la vista actual del panel de administración.
   * Puede ser 'usuarios', 'reservas' o 'vehiculos'.
   */
  vistaActual: string = 'usuarios';
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
    this.vehiculos = this.vehiculoService.getVehiculos() || [];
    
  }

  /**
   * @description
   * Método que cambia la vista actual del panel de administración.
   * @param vista La vista a la que se desea cambiar ('usuarios', 'reservas' o 'vehiculos').
   */
  cambiarVista(vista: string): void {
    this.vistaActual = vista;
  }

  /**
   * @description
   * Método que actualiza el estado de una reserva.
   * Emite un evento con la reserva y el nuevo estado.
   * @param evento Objeto que contiene la reserva y el nuevo estado.
   */
  actualizarEstadoReserva(evento: {reserva: Reserva, nuevoEstado: string}): void {
    const { reserva, nuevoEstado } = evento;
    const antiguaReserva = { ...reserva };
    reserva.estado = nuevoEstado;

    if (nuevoEstado === 'Completada' || nuevoEstado === 'Cancelada') {
      const auto = this.vehiculos.find(v => Number(v.id) === Number(reserva.idVehiculo));
      if (auto) auto.disponible = true;
    } else if (antiguaReserva.estado === 'Completada' || antiguaReserva.estado === 'Cancelada') {
      const auto = this.vehiculos.find(v => Number(v.id) === Number(reserva.idVehiculo));
      if (auto) auto.disponible = false;
    }

    this.vehiculoService.saveVehiculos(this.vehiculos);
    this.reservaService.guardarReservas(this.reservas);
  }
}