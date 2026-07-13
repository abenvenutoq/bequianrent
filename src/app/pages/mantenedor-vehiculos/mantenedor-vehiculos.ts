import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehiculosJsonServerService } from '../../services/vehiculos-json-server.services';
import { Vehiculo } from '../../models/modelos';

/**
 * @description
 * Componente que representa el mantenedor de vehículos.
 * Permite agregar, editar y eliminar vehículos.
 */
@Component({
  selector: 'mantenedor-vehiculos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mantenedor-vehiculos.html',
  styleUrls: ['./mantenedor-vehiculos.css']
})
export class MantenedorVehiculos implements OnInit {
  
  /**
   * @description
   * Formulario reactivo para manejar los datos de los vehículos.
   * Incluye validaciones para cada campo.
   */
  vehiculosForm: FormGroup;
  vehiculos: Vehiculo[] = [];
  modoEdicion = false;
  idEditando: number | null = null;
  mensajeAlerta: string | null = null;
  tipoAlerta: 'success' | 'danger' | 'warning' | null = null; // Agregamos 'warning' para validaciones

  private cdr = inject(ChangeDetectorRef);

  /**
   * @description
   * Constructor del componente.
   * Inicializa el formulario reactivo con sus validaciones.
   */
  constructor(
    private fb: FormBuilder,
    private vehiculosService: VehiculosJsonServerService
  ) {
    this.vehiculosForm = this.fb.group({
      marca: ['', [Validators.required, Validators.minLength(2)]],
      modelo: ['', Validators.required],
      tipo: ['', Validators.required],
      anio: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      precio: ['', [Validators.required, Validators.min(0)]],
      disponible: [true, Validators.required],
      transmision: ['', Validators.required],
      pasajeros: ['', [Validators.required, Validators.min(1)]],
      rendimiento: ['', Validators.required],
      imagen: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * @description
   * Carga los datos de los vehículos desde el servicio y los asigna a la propiedad `vehiculos`.
   * Maneja errores de conexión mostrando un mensaje de alerta.
   * @returns {void}
   */
  private cargarDatos(): void {
    this.vehiculosService.getVehiculo().subscribe({
      next: (vehiculos) => {
        this.vehiculos = vehiculos;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mostrarAlerta('Error al conectar con el servidor para cargar los vehículos.', 'danger');
      }
    });
  }

  /**
   * @description
   * Verifica si un campo del formulario es inválido y ha sido tocado o modificado.
   * Esto se utiliza para mostrar mensajes de error de validación en la interfaz.
   * @param campo El nombre del campo a verificar.
   * @returns {boolean} `true` si el campo es inválido y ha sido tocado o modificado, `false` en caso contrario.
   */
  esCampoInvalido(campo: string): boolean {
    const control = this.vehiculosForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * @description
   * Muestra un mensaje de alerta en la interfaz durante 3 segundos.
   * @param mensaje El mensaje a mostrar.
   * @param tipo El tipo de alerta, puede ser 'success', 'warning' o 'danger'.
   * @returns {void}
   */
  mostrarAlerta(mensaje: string, tipo: 'success' | 'danger' | 'warning'): void {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    this.cdr.detectChanges(); // Forzamos la actualización de la vista de inmediato
  }

  /**
   * @description
   * Guarda un vehículo nuevo o actualiza uno existente según el estado de `modoEdicion`.
   * Valida el formulario antes de enviar los datos al servicio.
   * Muestra mensajes de alerta según el resultado de la operación.
   * @returns {void}
   */
  guardarVehiculo(): void {
    // 1. Validamos el formulario y marcamos los campos para que se pinten de rojo
    if (this.vehiculosForm.invalid) {
      this.vehiculosForm.markAllAsTouched(); 
      this.mostrarAlerta('Por favor, completa correctamente los campos marcados en rojo.', 'warning');
      return;
    }

    const vehiculoData = this.vehiculosForm.value as Omit<Vehiculo, 'id'>;

    // 2. Lógica de edición
    if (this.modoEdicion && this.idEditando !== null) {
      const vehiculoActualizado: Vehiculo = { id: this.idEditando, ...vehiculoData };
      
      this.vehiculosService.updateVehiculo(vehiculoActualizado).subscribe({
        next: (vehiculo) => {
          const index = this.vehiculos.findIndex(v => v.id === vehiculo.id);
          if (index !== -1) {
            this.vehiculos[index] = vehiculo;
          }
          // IMPORTANTE: Primero cancelamos la edición (reseteamos el form) y LUEGO mostramos la alerta
          this.cancelarEdicion(false); 
          this.mostrarAlerta('Vehículo actualizado exitosamente.', 'success');
        },
        error: () => {
          this.mostrarAlerta('Error al actualizar el vehículo en el servidor.', 'danger');
        }
      });
    } 
    // 3. Lógica de creación
    else {
      this.vehiculosService.addVehiculo(vehiculoData).subscribe({
        next: (vehiculo) => {
          this.vehiculos.push(vehiculo);
          // IMPORTANTE: Primero cancelamos la edición (reseteamos el form) y LUEGO mostramos la alerta
          this.cancelarEdicion(false); 
          this.mostrarAlerta('Vehículo agregado exitosamente a la flota.', 'success');
        },
        error: () => {
          this.mostrarAlerta('Error al agregar el vehículo al servidor.', 'danger');
        }
      });
    }
  }

  /**
   * @description
   * Prepara el formulario para editar un vehículo existente.
   * Carga los datos del vehículo seleccionado en el formulario y activa el modo de edición.
   * @param vehiculo El vehículo que se desea editar.
   * @returns {void}
   */
  editarVehiculo(vehiculo: Vehiculo): void {
    this.modoEdicion = true;
    this.idEditando = vehiculo.id;
    this.vehiculosForm.patchValue(vehiculo);
    // Hacemos scroll hacia arriba para que el usuario vea el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * @description
   * Elimina un vehículo existente después de confirmar la acción con el usuario.
   * Actualiza la lista de vehículos y muestra un mensaje de alerta según el resultado.
   * @param id El ID del vehículo que se desea eliminar.
   * @returns {void}
   */
  eliminarVehiculo(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este vehículo de forma permanente?')) {
      this.vehiculosService.deleteVehiculo(id).subscribe({
        next: () => {
          this.vehiculos = this.vehiculos.filter(v => v.id !== id);
          this.mostrarAlerta('Vehículo eliminado exitosamente.', 'success');
        },
        error: () => {
          this.mostrarAlerta('Error al intentar eliminar el vehículo.', 'danger');
        }
      });
    }
  }

  /**
   * @description
   * Cancela el modo de edición y resetea el formulario.
   * @param limpiarAlertas Determina si se deben borrar las alertas en pantalla (por defecto: true).
   * @returns {void}
   */
  cancelarEdicion(limpiarAlertas: boolean = true): void {
    this.modoEdicion = false;
    this.idEditando = null;
    
    // Al resetear, volvemos a dejar "disponible" en true para que el select no quede en blanco
    this.vehiculosForm.reset({ disponible: true }); 
    
    // Solo borramos las alertas si es una cancelación manual, no tras un guardado exitoso
    if (limpiarAlertas) {
      this.mensajeAlerta = null;
      this.tipoAlerta = null;
    }
  }

}