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
 * Componente para editar una reserva existente. Permite modificar el vehículo, las fechas y recalcula el total de la reserva.
 */
@Component({
  selector: 'app-editar-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './editar-reserva.html',
  styleUrls: ['./editar-reserva.css']
})

export class EditarReserva implements OnInit {
  /** Instancia FormBuilder para crear formularios reactivos */
  private fb = inject(FormBuilder);
  /** Instancia ActivatedRoute para acceder a los parámetros de la ruta */
  private route = inject(ActivatedRoute);
  /** Instancia router para la navegación */
  private router = inject(Router);
  /** Instancia del servicio de reservas */
  private reservaService = inject(ReservaService);
  /** Instancia del servicio de vehículos */
  private vehiculoService = inject(VehiculosJsonServerService);
  /** Instancia del servicio de validación */
  private validacionService = inject(ValidacionService);
  /** Instancia ChangeDetectorRef para detectar cambios manualmente */
  private cdr = inject(ChangeDetectorRef);

  /** Instancia del formulario de edición */
  editarForm!: FormGroup;
  /** Identificador del vehículo seleccionado */
  reservaId!: string | number;
  /** Reserva actual que se está editando */
  reservaActual: Reserva | undefined;
  /** Fecha mínima permitida para la reserva */
  fechaMinima!: string;
  
  /** Lista de vehículos disponibles */
  vehiculos: Vehiculo[] = [];
  /** Total calculado de la reserva */
  totalCalculado: number = 0;


  /**
   * @description
   * Inicializa el componente, carga la reserva actual y configura el formulario de edición.
   */
  ngOnInit(): void {
    this.reservaId = this.route.snapshot.paramMap.get('id')!;
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
    
    const todasReservas = this.reservaService.obtenerReservas();
    this.reservaActual = todasReservas.find(r => String(r.id) === String(this.reservaId));

    if (!this.reservaActual) {
      alert('Reserva no encontrada');
      this.router.navigate(['/admin-panel']);
      return;
    }

    /** Refresca la lista de vehículos disponibles */
    this.refrescarFlota();

    this.editarForm = this.fb.group({
      vehiculoId: [this.reservaActual.idVehiculo, Validators.required],
      fechaDesde: [this.reservaActual.fechaDesde, Validators.required],
      fechaHasta: [this.reservaActual.fechaHasta, Validators.required]
    }, {
        validators: [this.validacionService.validarFechasReserva.bind(this.validacionService)]
    });

    this.totalCalculado = this.reservaActual.total || 0;

    this.editarForm.valueChanges.subscribe(() => {
      this.recalcularTotal();
    });
  }

 
  /**
   * @description
   * Refresca la lista de vehículos disponibles desde el servidor.
   * @returns Una promesa que se resuelve cuando la lista se ha actualizado.
   */
  refrescarFlota(): Promise<void> {
    return new Promise((resolve) => {
      this.vehiculoService.getVehiculo().subscribe({
        next: (vehiculos) => {
          this.vehiculos = vehiculos;
          this.cdr.detectChanges();
          resolve(); // Avisamos que ya terminó de cargar
        },
        error: () => {
          this.vehiculos = [];
          resolve();
        }
      });
    });
  }

  /**
   * @description
   * Recalcula el total de la reserva basado en el vehículo seleccionado y las fechas ingresadas.
   * Si las fechas son inválidas o el vehículo no está seleccionado, el total se establece en 0.
   */
  recalcularTotal(): void {
    const { vehiculoId, fechaDesde, fechaHasta } = this.editarForm.value;
    if (!vehiculoId || !fechaDesde || !fechaHasta) return;

    const autoSeleccionado = this.vehiculos.find(v => String(v.id) === String(vehiculoId));
    if (!autoSeleccionado) return;

    const inicio = new Date(fechaDesde);
    const fin = new Date(fechaHasta);
    
    if (fin <= inicio) {
        this.totalCalculado = 0;
        return;
    }

    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    this.totalCalculado = diffDays * (autoSeleccionado.precio || 0);
  }

  /**
   * @description
   * Guarda los cambios realizados en la reserva. Actualiza la disponibilidad de los vehículos si se ha cambiado el vehículo seleccionado.
   * Si el formulario es inválido o el total calculado es menor o igual a 0, no realiza ninguna acción.
   * @returns Una promesa que se resuelve cuando los cambios se han guardado correctamente.
   */
  async guardarCambios(): Promise<void> {
    if (this.editarForm.invalid || this.totalCalculado <= 0) return;

    const { vehiculoId, fechaDesde, fechaHasta } = this.editarForm.value;
    const vehiculoIdNumerico = Number(vehiculoId);

    if (String(this.reservaActual!.idVehiculo) !== String(vehiculoIdNumerico)) {
        
        const autoAntiguo = this.vehiculos.find(v => String(v.id) === String(this.reservaActual!.idVehiculo));
        const autoNuevo = this.vehiculos.find(v => String(v.id) === String(vehiculoIdNumerico));

        if (autoAntiguo) autoAntiguo.disponible = true;
        if (autoNuevo) autoNuevo.disponible = false;

        try {
          const actualizaciones: Promise<unknown>[] = [];

          if (autoAntiguo) {
            actualizaciones.push(firstValueFrom(this.vehiculoService.updateVehiculo(autoAntiguo)));
          }

          if (autoNuevo) {
            actualizaciones.push(firstValueFrom(this.vehiculoService.updateVehiculo(autoNuevo)));
          }

          await Promise.all(actualizaciones);
          
          /** Refrescamos la flota desde el servidor para asegurar sincronización total antes de continuar */
          await this.refrescarFlota();

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