import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ReservaService } from '../../services/reservas.services';
import { VehiculosJsonServerService } from '../../services/vehiculos-json-server.services';
import { Reserva, Vehiculo } from '../../models/modelos';
import { ValidacionService } from '../../services/validacion.services';

/**
 * @description
 * Componente dedicado a la edición de reservas existentes por parte del administrador.
 * Permite reasignar vehículos, modificar fechas de arriendo y recalcula automáticamente
 * el valor total a pagar basándose en la diferencia de días.
 * * @usageNotes
 * - Este componente está protegido por el Guard de administrador (`adminGuard`).
 * - Se encarga de gestionar la disponibilidad cruzada: si se cambia el vehículo de la reserva,
 * libera automáticamente el vehículo anterior y marca como ocupado el nuevo.
 */
@Component({
  selector: 'app-editar-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './editar-reserva.html',
  styleUrls: ['./editar-reserva.css']
})
export class EditarReserva implements OnInit {
  
  /** Creador de formularios reactivos inyectado para la gestión de campos. */
  private fb = inject(FormBuilder);
  /** Servicio para obtener parámetros de la URL activa (ej. el ID de la reserva a editar). */
  private route = inject(ActivatedRoute);
  /** Servicio de enrutamiento para redireccionar tras guardar o cancelar. */
  private router = inject(Router);
  /** Servicio para la lectura y persistencia de reservas. */
  private reservaService = inject(ReservaService);
  /** Servicio para la lectura y gestión del inventario de vehículos. */
  private vehiculoService = inject(VehiculosJsonServerService);
  /** Servicio con utilidades de validación, usado para validar la coherencia de las fechas. */
  private validacionService = inject(ValidacionService);

  private cdr = inject(ChangeDetectorRef);

  /** Formulario reactivo principal que contiene los campos de la reserva. */
  editarForm!: FormGroup;
  /** Identificador único de la reserva extraído de la URL. */
  reservaId!: string | number;
  /** Objeto que almacena los datos originales de la reserva antes de ser modificados. */
  reservaActual: Reserva | undefined;
  /** Almacena la fecha actual formateada para bloquear la selección de fechas pasadas en el HTML. */
  fechaMinima!: string;
  
  /** Lista completa de vehículos disponibles y no disponibles para nutrir el elemento select. */
  vehiculos: Vehiculo[] = [];
  /** Valor monetario calculado dinámicamente según las fechas ingresadas y el vehículo seleccionado. */
  totalCalculado: number = 0;

  /**
   * Iniciación del componente.
   * 1. Captura el ID de la reserva desde los parámetros de la ruta.
   * 2. Recupera la reserva correspondiente y los vehículos del sistema.
   * 3. Inicializa el formulario reactivo pre-rellenando los datos.
   * 4. Se suscribe a los cambios del formulario para disparar el recálculo matemático automático.
   */
  ngOnInit(): void {
    // Obtener el ID de la reserva desde la URL
    this.reservaId = this.route.snapshot.paramMap.get('id')!;
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
    
    // Buscar la reserva
    const todasReservas = this.reservaService.obtenerReservas();
    this.reservaActual = todasReservas.find(r => String(r.id) === String(this.reservaId));

    if (!this.reservaActual) {
      alert('Reserva no encontrada');
      this.router.navigate(['/admin-panel']);
      return;
    }

    // Obtener vehículos para el Select desde JSON Server
    this.vehiculoService.getVehiculo().subscribe({
      next: (vehiculos) => {
        this.vehiculos = vehiculos;
        this.cdr.detectChanges();
      },
      error: () => {
        this.vehiculos = [];
      }
    });

    // Inicializar formulario con los datos actuales
    this.editarForm = this.fb.group({
      vehiculoId: [this.reservaActual.idVehiculo, Validators.required],
      fechaDesde: [this.reservaActual.fechaDesde, Validators.required],
      fechaHasta: [this.reservaActual.fechaHasta, Validators.required]
    }, {
        // Validación personalizada a nivel de grupo para asegurar que la fecha final sea lógica
        validators: [this.validacionService.validarFechasReserva.bind(this.validacionService)]
    });

    this.totalCalculado = this.reservaActual.total || 0;

    // Escuchar cambios dinámicos en el formulario para recalcular el precio
    this.editarForm.valueChanges.subscribe(() => {
      this.recalcularTotal();
    });
  }

  /**
   * Método encargado de realizar la matemática financiera de la reserva.
   * * Calcula la diferencia en días exactos entre `fechaDesde` y `fechaHasta`.
   * * Multiplica la cantidad de días por la tarifa diaria del vehículo seleccionado.
   * * Si las fechas son inválidas (ej. fecha de fin menor a la de inicio), el total se fija en 0.
   */
  recalcularTotal(): void {
    const { vehiculoId, fechaDesde, fechaHasta } = this.editarForm.value;
    if (!vehiculoId || !fechaDesde || !fechaHasta) return;

    const autoSeleccionado = this.vehiculos.find(v => String(v.id) === String(vehiculoId));
    if (!autoSeleccionado) return;

    const inicio = new Date(fechaDesde);
    const fin = new Date(fechaHasta);
    
    // Si la fecha de fin es menor o igual a la de inicio, no calculamos
    if (fin <= inicio) {
        this.totalCalculado = 0;
        return;
    }

    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Asigna el total basándose en el precio del vehículo
    this.totalCalculado = diffDays * (autoSeleccionado.precio || 0);
  }

  /**
   * Procesa la solicitud final de guardado de los cambios de la reserva.
   * * Valida el formulario y la coherencia del precio.
   * * Intercambia los estados de disponibilidad si el administrador seleccionó un vehículo distinto.
   * * Actualiza el objeto de la reserva en el almacenamiento persistente.
   * * Redirige a la vista de "Reservas Realizadas" en el panel de administración.
   */
  async guardarCambios(): Promise<void> {
    if (this.editarForm.invalid || this.totalCalculado <= 0) return;

    const { vehiculoId, fechaDesde, fechaHasta } = this.editarForm.value;
    const vehiculoIdNumerico = Number(vehiculoId);

    // 1. Lógica para actualizar estados de los vehículos si cambió de auto
    if (String(this.reservaActual!.idVehiculo) !== String(vehiculoIdNumerico)) {
        
        const autoAntiguo = this.vehiculos.find(v => String(v.id) === String(this.reservaActual!.idVehiculo));
        const autoNuevo = this.vehiculos.find(v => String(v.id) === String(vehiculoIdNumerico));

        if (autoAntiguo) autoAntiguo.disponible = true;  // Liberamos el anterior
        if (autoNuevo) autoNuevo.disponible = false;     // Ocupamos el nuevo

        try {
          const actualizaciones: Promise<unknown>[] = [];

          if (autoAntiguo) {
            actualizaciones.push(firstValueFrom(this.vehiculoService.updateVehiculo(autoAntiguo)));
          }

          if (autoNuevo) {
            actualizaciones.push(firstValueFrom(this.vehiculoService.updateVehiculo(autoNuevo)));
          }

          await Promise.all(actualizaciones);
        } catch {
          if (autoAntiguo) autoAntiguo.disponible = false;
          if (autoNuevo) autoNuevo.disponible = true;
          alert('No se pudieron actualizar los vehículos en el servidor.');
          return;
        }
    }

    const todasReservas = this.reservaService.obtenerReservas();
    const index = todasReservas.findIndex(r => String(r.id) === String(this.reservaId));
    
    if (index !== -1) {
        todasReservas[index].idVehiculo = vehiculoIdNumerico;
        todasReservas[index].fechaDesde = fechaDesde;
        todasReservas[index].fechaHasta = fechaHasta;
        todasReservas[index].total = this.totalCalculado;
        
        this.reservaService.guardarReservas(todasReservas);
        
        alert('Reserva modificada con éxito');
        this.router.navigate(['/admin-panel'], { queryParams: { vista: 'reservas' } });
    }
  }
}