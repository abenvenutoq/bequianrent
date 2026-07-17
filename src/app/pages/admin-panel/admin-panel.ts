import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.services';
import { ReservaService } from '../../services/reservas.services';
import { VehiculosJsonServerService } from '../../services/vehiculos-json-server.services';
import { Usuario, Reserva, Vehiculo } from '../../models/modelos';

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
export class AdminPanel implements OnInit {
  private authService = inject(AuthService);
  private reservaService = inject(ReservaService);
  private vehiculoService = inject(VehiculosJsonServerService);

  // ✨ CAMBIO 1: Referencia al componente hijo para poder ejecutar sus funciones visuales
  @ViewChild(ReservasTablaComponent) tablaReservasComponente!: ReservasTablaComponent;

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
   * @param evento Objeto que contiene la reserva, el nuevo estado, el índice de la fila y el estado anterior.
   */
  async actualizarEstadoReserva(evento: {reserva: Reserva, nuevoEstado: string, index: number, estadoAnterior: string}): Promise<void> {
    const { reserva, nuevoEstado, index, estadoAnterior } = evento;

    /** Verificamos si el estado realmente ha cambiado */
    if (estadoAnterior === nuevoEstado) {
      return;
    }

    reserva.estado = nuevoEstado;
    this.reservaService.guardarReservas(this.reservas);

    const seLibera = nuevoEstado === 'Completada' || nuevoEstado === 'Cancelada';
    const estabaLiberada = estadoAnterior === 'Completada' || estadoAnterior === 'Cancelada';

    /** Si el cambio de estado no afecta la disponibilidad del vehículo, mostramos un mensaje y salimos */
    if (seLibera === estabaLiberada) {
      if (this.tablaReservasComponente) {
          this.tablaReservasComponente.mostrarMensaje(`Estado actualizado correctamente a ${nuevoEstado}.`, 'success');
      }
      return;
    }
    
    const auto = this.vehiculos.find(v => Number(v.id) === Number(reserva.idVehiculo));
    /** Verificamos si el vehículo existe antes de intentar actualizar su disponibilidad */
    if (!auto) {
      if (this.tablaReservasComponente) {
          this.tablaReservasComponente.mostrarMensaje(`Estado actualizado, pero no se encontró el vehículo para modificar su disponibilidad.`, 'success');
      }
      return;
    }

    const disponibilidadNueva = seLibera;
    /** Si la disponibilidad del vehículo no ha cambiado, mostramos un mensaje y salimos */
    if (auto.disponible === disponibilidadNueva) {
      if (this.tablaReservasComponente) {
          this.tablaReservasComponente.mostrarMensaje(`Estado de reserva actualizado a ${nuevoEstado}.`, 'success');
      }
      return;
    }

    auto.disponible = disponibilidadNueva;
    /** Intentamos actualizar la disponibilidad del vehículo en el backend */
    try {
      await firstValueFrom(this.vehiculoService.updateVehiculo(auto));
      
      /** Mostramos mensaje de éxito si todo salió bien */
      if (this.tablaReservasComponente) {
          this.tablaReservasComponente.mostrarMensaje(`Reserva #${reserva.id} actualizada y disponibilidad del vehículo sincronizada.`, 'success');
      }

    } catch {
      auto.disponible = !disponibilidadNueva;
      reserva.estado = estadoAnterior;
      this.reservaService.guardarReservas(this.reservas); 
      
      /** Mostramos mensaje de error si la actualización falla */
      if (this.tablaReservasComponente) {
          this.tablaReservasComponente.revertirEstado(index, estadoAnterior);
      }
    }
  }
}