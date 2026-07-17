import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
  
  @Input() listaReservas: Reserva[] = [];
  @Input() listaVehiculos: Vehiculo[] = []; 

  /** 
   * @description 
   * Modificamos el evento para enviar más contexto al padre (index y estadoAnterior)
   */
  @Output() onEstadoCambiado = new EventEmitter<{reserva: Reserva, nuevoEstado: string, index: number, estadoAnterior: string}>();

  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  adminForm!: FormGroup;
  
  /** Variable para manejar la alerta visual en el HTML */
  notificacion: { texto: string, tipo: 'success' | 'danger' } | null = null;

  ngOnInit(): void {
    this.adminForm = this.fb.group({
      reservasControls: this.fb.array([])
    });

    this.construirFormulario();
  }

  get reservasFormArray(): FormArray {
    return this.adminForm.get('reservasControls') as FormArray;
  }

  private construirFormulario(): void {
    // Agregamos el 'index' al forEach
    this.listaReservas.forEach((reserva, index) => {
      const grupo = this.fb.group({
        estado: [reserva.estado]
      });

      grupo.get('estado')?.valueChanges.subscribe(nuevoEstado => {
        if (nuevoEstado && nuevoEstado !== reserva.estado) {
          // Emitimos toda la información necesaria para que el padre pueda actuar
          this.onEstadoCambiado.emit({ 
              reserva, 
              nuevoEstado, 
              index, 
              estadoAnterior: reserva.estado 
          });
        }
      });

      this.reservasFormArray.push(grupo);
    });
  }

  obtenerNombreAuto(idVehiculo: number | string): string {
    const auto = this.listaVehiculos.find(v => Number(v.id) === Number(idVehiculo));
    return auto ? `${auto.marca} ${auto.modelo}` : 'Vehículo no encontrado';
  }

  /**
   * @description Muestra una alerta temporal en la parte superior de la tabla.
   */
  mostrarMensaje(texto: string, tipo: 'success' | 'danger') {
    this.notificacion = { texto, tipo };
    this.cdr.detectChanges(); // Forzamos la detección de cambios para que la alerta se muestre inmediatamente
    // Ocultar automáticamente después de 4 segundos
    setTimeout(() => {
        this.notificacion = null;
        this.cdr.detectChanges(); // Forzamos la detección de cambios para que la alerta desaparezca inmediatamente
    }, 4000);
  }

  /**
   * @description Revierte visualmente el select al estado anterior si el servidor falla.
   * El parámetro { emitEvent: false } evita que se vuelva a disparar el ciclo infinito.
   */
  revertirEstado(index: number, estadoAnterior: string) {
    const control = this.reservasFormArray.at(index).get('estado');
    if (control) {
        control.setValue(estadoAnterior, { emitEvent: false });
    }
    this.mostrarMensaje('Fallo de conexión: El cambio de estado fue revertido.', 'danger');
  }
}