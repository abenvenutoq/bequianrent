import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 👈 Importante para el [(ngModel)] del select del estado
import { AuthService } from '../../services/auth.services';
import { ReservaService } from '../../services/reservas.services';
import { VehiculoService } from '../../services/vehiculos.services';
import { Usuario, Reserva, Vehiculo } from '../../models/modelos';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {
  private authService = inject(AuthService);
  private reservaService = inject(ReservaService);
  private vehiculoService = inject(VehiculoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Control de la vista activa (reemplaza al cambiarVista de JS)
  vistaActual: 'usuarios' | 'reservas' | 'vehiculos' = 'usuarios';

  // Arreglos de datos
  usuarios: Usuario[] = [];
  reservas: Reserva[] = [];
  vehiculos: Vehiculo[] = [];

  ngOnInit(): void {
    // Protección SSR para evitar problemas con F5
    if (!this.authService.isBrowser()) return;

    // Validación de seguridad: Si no es admin, lo expulsamos al inicio
    if (!this.authService.esAdmin()) {
      this.router.navigate(['/login']);
      return;
    }

    const vistaParam = this.route.snapshot.queryParamMap.get('vista');

    if (vistaParam === 'usuarios' || vistaParam === 'reservas' || vistaParam === 'vehiculos'){
      this.vistaActual = vistaParam;
    }

    // Cargamos todos los datos iniciales
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.usuarios = this.authService.obtenerUsusario() || [];
    this.reservas = this.reservaService.obtenerReservas() || [];
    this.vehiculos = this.vehiculoService.getVehiculos() || [];
  }

  // Cambia la sección activa del submenú
  cambiarVista(vista: 'usuarios' | 'reservas' | 'vehiculos'): void {
    this.vistaActual = vista;
  }

  // Retorna el contador dinámico para la insignia del título
  getContadorActual(): number {
    if (this.vistaActual === 'usuarios') return this.usuarios.length;
    if (this.vistaActual === 'reservas') return this.reservas.length;
    if (this.vistaActual === 'vehiculos') return this.vehiculos.length;
    return 0;
  }

  // Cambiar estado de una reserva (Administrado por el Admin)
  cambiarEstadoReserva(reserva: Reserva, nuevoEstado: string): void {
    reserva.estado = nuevoEstado;
    
    // Si el estado pasa a "Completada", el auto vuelve a estar disponible
    if (nuevoEstado === 'Completada') {
      const auto = this.vehiculos.find(v => Number(v.id) === Number(reserva.idVehiculo));
      if (auto) {
        auto.disponible = true;
        this.vehiculoService.saveVehiculos(this.vehiculos); // Guarda la flota actualizada
      }
    }

    if (nuevoEstado === 'Cancelada') {
      const auto = this.vehiculos.find(v => Number(v.id) === Number(reserva.idVehiculo));
      if (auto) {
        auto.disponible = true;
        this.vehiculoService.saveVehiculos(this.vehiculos); // Guarda la flota actualizada
      }
    }
    
    // Si pasa a "Confirmada", asumimos que el auto está ocupado
    if (nuevoEstado === 'Confirmada') {
      const auto = this.vehiculos.find(v => Number(v.id) === Number(reserva.idVehiculo));
      if (auto) {
        auto.disponible = false;
        this.vehiculoService.saveVehiculos(this.vehiculos);
      }
    }

    // Guardamos la lista de reservas modificada en el localStorage
    this.reservaService.guardarReservas(this.reservas);
    alert(`Estado de la reserva #${reserva.id} modificado a: ${nuevoEstado}`);
  }

  // Eliminar un vehículo de la flota
  eliminarVehiculo(id: number | string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este vehículo de la flota?')) {
      // Filtramos el arreglo para quitar el auto seleccionado
      this.vehiculos = this.vehiculos.filter(v => Number(v.id) !== Number(id));
      // Guardamos los cambios de manera persistente
      this.vehiculoService.saveVehiculos(this.vehiculos);
      alert('Vehículo eliminado con éxito.');
    }
  }

  // Helper para mostrar la marca/modelo del auto en la tabla de reservas
  obtenerNombreAuto(idVehiculo: number | string): string {
    const auto = this.vehiculos.find(v => Number(v.id) === Number(idVehiculo));
    return auto ? `${auto.marca} ${auto.modelo}` : `Vehículo #${idVehiculo}`;
  }
}