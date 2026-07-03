import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 👈 Importante para el [(ngModel)] del select del estado
import { AuthService } from '../../services/auth.services';
import { ReservaService } from '../../services/reservas.services';
import { VehiculoService } from '../../services/vehiculos.services';
import { Usuario, Reserva, Vehiculo } from '../../models/modelos';

/**
 * @description
 * Componente principal del Panel de Administración (Dashboard).
 * Centraliza la gestión de las tres entidades clave del sistema: Usuarios, Reservas y Vehículos.
 * * *Características principales:*
 * - Interfaz basada en pestañas dinámicas (Submenús).
 * - Permite modificar en tiempo real el estado de las reservas (con `[(ngModel)]`).
 * - Gestiona la sincronización cruzada: al cambiar el estado de una reserva a "Completada" o "Cancelada", 
 * libera automáticamente el vehículo asociado.
 * - Permite dar de baja (eliminar) vehículos de la flota.
 * * @usageNotes
 * - Este componente requiere que el usuario posea el rol `admin`.
 * - Está protegido tanto por un Guard en el sistema de rutas como por validaciones extra en su inicialización.
 */
@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {

  /** Servicio para validar roles de acceso y recuperar usuarios. */
  private authService = inject(AuthService);
  /** Servicio para manipular el registro histórico de reservas. */
  private reservaService = inject(ReservaService);
  /** Servicio para gestionar el inventario de la flota automotriz. */
  private vehiculoService = inject(VehiculoService);
  /** Servicio de enrutamiento para redireccionar usuarios no autorizados. */
  private router = inject(Router);
  /** Servicio para interceptar parámetros de la URL (Query Params). */
  private route = inject(ActivatedRoute);

  /** * Determina la sección activa que se está renderizando actualmente en el DOM.
   * Valores posibles: `'usuarios'`, `'reservas'`, `'vehiculos'`. */  
  vistaActual: 'usuarios' | 'reservas' | 'vehiculos' = 'usuarios';

  /** Colección local de todos los usuarios registrados en el sistema. */
  usuarios: Usuario[] = [];
  /** Colección local de todas las reservas de arrendamiento vigentes e históricas. */
  reservas: Reserva[] = [];
  /** Colección local con el inventario completo de la flota. */
  vehiculos: Vehiculo[] = [];

  /**
   * Ciclo de vida inicial del Panel.
   * 1. Detiene su ejecución si está renderizándose en el Servidor (SSR).
   * 2. Comprueba de forma síncrona que la sesión activa corresponda a un administrador.
   * 3. Lee la URL en búsqueda del parámetro `?vista=` para autoseleccionar una pestaña.
   * 4. Carga las bases de datos locales a las variables del componente.
   */
  ngOnInit(): void {
    if (!this.authService.isBrowser()) return;

    if (!this.authService.esAdmin()) {
      this.router.navigate(['/login']);
      return;
    }

    const vistaParam = this.route.snapshot.queryParamMap.get('vista');

    if (vistaParam === 'usuarios' || vistaParam === 'reservas' || vistaParam === 'vehiculos'){
      this.vistaActual = vistaParam;
    }

    this.cargarDatos();
  }

  /**
   * Extrae la información consolidada desde todos los servicios (LocalStorage) 
   * para poblar las tablas del Panel de Administración.
   */
  cargarDatos(): void {
    this.usuarios = this.authService.obtenerUsuario() || [];
    this.reservas = this.reservaService.obtenerReservas() || [];
    this.vehiculos = this.vehiculoService.getVehiculos() || [];
  }

  /**
   * Alterna la vista principal de la interfaz sin necesidad de recargar la página.
   * @param {'usuarios' | 'reservas' | 'vehiculos'} vista El nombre exacto de la sección que el admin desea visualizar.
   */
  cambiarVista(vista: 'usuarios' | 'reservas' | 'vehiculos'): void {
    this.vistaActual = vista;
  }

  /**
   * Retorna numéricamente la cantidad de elementos de la vista actualmente seleccionada.
   * Se utiliza generalmente para alimentar las insignias (badges) en el título de la página.
   * @returns {number} El total de registros de la lista activa.
   */
  getContadorActual(): number {
    if (this.vistaActual === 'usuarios') return this.usuarios.length;
    if (this.vistaActual === 'reservas') return this.reservas.length;
    if (this.vistaActual === 'vehiculos') return this.vehiculos.length;
    return 0;
  }

  /**
   * Modifica el estado de ciclo de vida de una reserva (Ej: Confirmada, Cancelada, Completada).
   * *Reglas de Negocio:*
   * - Si el estado pasa a **Completada** o **Cancelada**, el vehículo arrendado recupera su disponibilidad (`true`).
   * - Si el estado pasa a **Confirmada**, el vehículo queda bloqueado para nuevos arriendos (`false`).
   * * @param {Reserva} reserva El objeto completo de la reserva a modificar.
   * @param {string} nuevoEstado El nuevo string de estado extraído desde el control select del HTML.
   */
  cambiarEstadoReserva(reserva: Reserva, nuevoEstado: string): void {
    reserva.estado = nuevoEstado;
    
    // Si el estado pasa a "Completada" o "Cancelada", el auto vuelve a estar disponible
    if (nuevoEstado === 'Completada' || nuevoEstado === 'Cancelada') {
      const auto = this.vehiculos.find(v => Number(v.id) === Number(reserva.idVehiculo));
      if (auto) {
        auto.disponible = true;
        this.vehiculoService.saveVehiculos(this.vehiculos);
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

    this.reservaService.guardarReservas(this.reservas);
    alert(`Estado de la reserva #${reserva.id} modificado a: ${nuevoEstado}`);
  }

  /**
   * Elimina un vehículo definitivamente del registro de la flota local.
   * Emite un cuadro de diálogo nativo de confirmación antes de proceder a filtrar y guardar.
   * @param {number | string} id Identificador único del vehículo.
   */
  eliminarVehiculo(id: number | string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este vehículo de la flota?')) {
      // Filtramos el arreglo para quitar el auto seleccionado
      this.vehiculos = this.vehiculos.filter(v => Number(v.id) !== Number(id));
      // Guardamos los cambios de manera persistente
      this.vehiculoService.saveVehiculos(this.vehiculos);
      alert('Vehículo eliminado con éxito.');
    }
  }

  /**
   * Helper que cruza la información entre la base de datos de reservas y la de vehículos,
   * permitiendo imprimir el nombre (Marca + Modelo) del auto dentro de la tabla de reservas.
   * @param {number | string} idVehiculo Identificador foráneo del auto en la reserva.
   * @returns {string} El nombre concatenado del vehículo, o un texto de contingencia si no se encuentra.
   */
  obtenerNombreAuto(idVehiculo: number | string): string {
    const auto = this.vehiculos.find(v => Number(v.id) === Number(idVehiculo));
    return auto ? `${auto.marca} ${auto.modelo}` : `Vehículo #${idVehiculo}`;
  }
}