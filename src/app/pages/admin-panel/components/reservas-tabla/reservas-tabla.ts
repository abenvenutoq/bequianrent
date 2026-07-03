import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Reserva, Vehiculo } from '../../../../models/modelos';

/** @description Componente para mostrar la tabla de reservas en el panel de administración */
@Component({
  selector: 'app-reservas-tabla',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reservas-tabla.html'
})
export class ReservasTablaComponent implements OnInit {
  
  /** 
   * @description 
   * Lista de reservas a mostrar */
  @Input() listaReservas: Reserva[] = [];
  @Input() listaVehiculos: Vehiculo[] = []; 

  /** 
   * @description 
   * Emite un evento cuando el estado de una reserva cambia */
  @Output() onEstadoCambiado = new EventEmitter<{reserva: Reserva, nuevoEstado: string}>();

  private fb = inject(FormBuilder);
  adminForm!: FormGroup;

  /**
   * @description Inicializa el formulario reactivo y construye los controles para cada reserva
   * en la lista de reservas. También se suscribe a los cambios de estado para emitir eventos al componente padre.
   */
  ngOnInit(): void {
    this.adminForm = this.fb.group({
      reservasControls: this.fb.array([])
    });

    this.construirFormulario();
  }

  /** 
   * @description Obtiene el FormArray que contiene los controles para cada reserva
   * @returns {FormArray} El FormArray de reservas
   */
  get reservasFormArray(): FormArray {
    return this.adminForm.get('reservasControls') as FormArray;
  }

  /**
   * @description Construye el formulario reactivo para cada reserva en la lista de reservas.
   * Crea un FormGroup para cada reserva y se suscribe a los cambios de estado para emitir eventos al componente padre.
   * Este método es llamado en ngOnInit para inicializar el formulario.
   */
  private construirFormulario(): void {
    this.listaReservas.forEach(reserva => {
      const grupo = this.fb.group({
        estado: [reserva.estado]
      });

      /** @description Suscribe a los cambios de estado para emitir eventos al componente padre */
      grupo.get('estado')?.valueChanges.subscribe(nuevoEstado => {
        if (nuevoEstado) {
          this.onEstadoCambiado.emit({ reserva, nuevoEstado });
        }
      });

      this.reservasFormArray.push(grupo);
    });
  }

  /**
   * @description Obtiene el nombre completo del vehículo asociado a una reserva dado su ID.
   * Busca en la lista de vehículos y devuelve una cadena con la marca y el modelo del vehículo.
   * @param {number | string} idVehiculo - El ID del vehículo a buscar.
   * @returns {string} El nombre completo del vehículo o un mensaje si no se encuentra.
   */
  obtenerNombreAuto(idVehiculo: number | string): string {
    const auto = this.listaVehiculos.find(v => Number(v.id) === Number(idVehiculo));
    return auto ? `${auto.marca} ${auto.modelo}` : 'Vehículo no encontrado';
  }
}