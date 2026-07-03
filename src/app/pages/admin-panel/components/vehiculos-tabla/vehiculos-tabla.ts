import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Vehiculo } from '../../../../models/modelos';

/**
 * @description
 * Componente que representa la tabla de vehículos en el panel de administración.
 * Permite mostrar la lista de vehículos y eliminar un vehículo.
 */
@Component({
  selector: 'app-vehiculos-tabla',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './vehiculos-tabla.html',
  styleUrl: './vehiculos-tabla.css',
})

/**
 * @description
 * Clase que implementa la lógica del componente VehiculosTablaComponent.
 * Se encarga de construir el formulario reactivo para la lista de vehículos y manejar la eliminación de vehículos.
 */
export class VehiculosTablaComponent implements OnInit {
  @Input() listaVehiculos: Vehiculo[] = [];
  @Output() onVehiculoEliminado = new EventEmitter<Vehiculo>();
  
  /**
   * @description
   * Inicializa el FormBuilder para construir el formulario reactivo.
   */
  private fb = inject(FormBuilder);
  adminForm!: FormGroup;

  /**
   * @description
   * Método que se ejecuta al inicializar el componente.
   * Construye el formulario reactivo para la lista de vehículos.
   */
  ngOnInit(): void {
    this.adminForm = this.fb.group({
      vehiculosControls: this.fb.array([])
    });

    this.construirFormulario();
  }
  
  /**
   * @description
   * Getter que devuelve el FormArray de vehículos del formulario reactivo.
   * Permite acceder a los controles de cada vehículo en la lista.
   * @returns {FormArray} El FormArray de vehículos.
   */
  get vehiculosFormArray(): FormArray {
    return this.adminForm.get('vehiculosControls') as FormArray;
  }

  /**
   * @description
   * Método privado que construye el formulario reactivo para la lista de vehículos.
   * Crea un grupo de controles para cada vehículo y los agrega al FormArray.
   * Cada grupo de controles contiene los campos del vehículo: id, imagen, marca, modelo, año y disponibilidad.
   */
  private construirFormulario(): void {
    this.listaVehiculos.forEach(vehiculo => {
      const grupo = this.fb.group({
        id: [vehiculo.id],
        imagen: [vehiculo.imagen],
        marca: [vehiculo.marca],
        modelo: [vehiculo.modelo],
        anio: [vehiculo.anio],
        disponible: [vehiculo.disponible],
      });

      this.vehiculosFormArray.push(grupo);
    });
  }

  /**
   * @description (DE MOMENTO SIN USO)
   * Método que elimina un vehículo de la lista y emite un evento.
   * @param vehiculo El vehículo a eliminar.
   */
  eliminarVehiculo(vehiculo: Vehiculo): void {
    this.onVehiculoEliminado.emit(vehiculo);
  } 
}
