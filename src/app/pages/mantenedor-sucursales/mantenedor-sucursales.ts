import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SucursalesService } from '../../services/sucursales.services';
import { Sucursales } from '../../models/modelos';

/**
 * @description
 * Componente que representa el mantenedor de sucursales.
 * Permite agregar, editar y eliminar sucursales.
 */
@Component({
  selector: 'mantenedor-sucursales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mantenedor-sucursales.html',
  styleUrls: ['./mantenedor-sucursales.css']
})
export class MantenedorSucursales implements OnInit {
  
  /**
   * @description
   * Formulario reactivo para manejar los datos de las sucursales.
   * Incluye validaciones para cada campo.
   */
  sucursalesForm: FormGroup;
  sucursales: Sucursales[] = [];
  modoEdicion = false;
  idEditando: number | null = null;

  constructor(
    private fb: FormBuilder,
    private sucursalesService: SucursalesService
  ) {
    this.sucursalesForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', Validators.required],
      ciudad: ['', Validators.required],
      telefono: ['', Validators.required],
      jefeSucursal: ['', Validators.required],
      horario: ['', Validators.required]
    });
  }

  /**
   * @description
   * Método que se ejecuta al inicializar el componente.
   * Carga las sucursales desde el servicio.
   */
  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * @description
   * Carga las sucursales desde el servicio y las almacena en la variable local.
   * Maneja errores en caso de que la carga falle.
   */
  cargarDatos(): void {
    this.sucursalesService.obtenerSucursales().subscribe({
      next: (data) => this.sucursales = data,
      error: (err) => console.error('Error cargando sucursales', err)
    });
  }

  /**
   * @description
   * Guarda una nueva sucursal o modifica una existente según el modo actual.
   * Valida que no existan nombres duplicados antes de guardar.
   * Actualiza la lista de sucursales después de la operación.
   * Si se está editando, se actualiza la sucursal correspondiente; si se está agregando, se crea una nueva.
   * Resetea el formulario y el estado de edición después de guardar.
   * Maneja errores en caso de que la operación falle.
   * @returns void 
   */
  guardarSucursal(): void {
    if (this.sucursalesForm.invalid) {
      this.sucursalesForm.markAllAsTouched();
      return;
    }

    const formValues = this.sucursalesForm.value;

    // Validación de nombre duplicado
    const nombreExiste = this.sucursales.some(s => 
      s.nombre.toLowerCase() === formValues.nombre.toLowerCase() && s.id !== this.idEditando
    );

    if (nombreExiste) {
      alert('Ya existe una sucursal con ese nombre. Por favor, elige otro.');
      return;
    }

    if (this.modoEdicion && this.idEditando !== null) {
      // EDITAR
      const sucursalModificada: Sucursales = { id: this.idEditando, ...formValues };
      this.sucursalesService.editarSucursal(sucursalModificada).subscribe(dataActualizada => {
        this.sucursales = dataActualizada;
        this.cancelarEdicion();
      });
    } else {
      // AGREGAR
      this.sucursalesService.agregarSucursal(formValues).subscribe(dataActualizada => {
        this.sucursales = dataActualizada;
        this.sucursalesForm.reset();
      });
    }
  }

  /**
   * @description
   * Inicia el modo de edición para una sucursal específica.
   * Llena el formulario con los datos de la sucursal seleccionada.
   * Cambia el estado del componente a modo edición.
   * @param sucursal La sucursal que se desea editar.
   * @returns void 
   */
  editarSucursal(sucursal: Sucursales): void {
    this.modoEdicion = true;
    this.idEditando = sucursal.id;
    
    this.sucursalesForm.patchValue({
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      ciudad: sucursal.ciudad,
      telefono: sucursal.telefono,
      jefeSucursal: sucursal.jefeSucursal,
      horario: sucursal.horario
    });
  }

  /**
   * @description
   * Elimina una sucursal específica después de confirmar la acción con el usuario.
   * Actualiza la lista de sucursales después de la eliminación.
   * Si se estaba editando la sucursal eliminada, cancela el modo de edición.
   * Maneja errores en caso de que la operación falle.
   * @param id El ID de la sucursal que se desea eliminar.
   * @returns void
   */
  eliminarSucursal(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta sucursal? Esta acción no se puede deshacer.')) {
      this.sucursalesService.eliminarSucursal(id).subscribe(dataActualizada => {
        this.sucursales = dataActualizada;
        
        if (this.idEditando === id) {
          this.cancelarEdicion();
        }
      });
    }
  }

  /**
   * @description
   * Cancela el modo de edición y resetea el formulario.
   * Cambia el estado del componente a modo agregar.
   * @returns void 
   */
  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.idEditando = null;
    this.sucursalesForm.reset();
  }
}