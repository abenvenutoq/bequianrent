import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
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
  mensajeAlerta: string | null = null;
  tipoAlerta: 'success' | 'danger' | null = null;

  private cdr = inject(ChangeDetectorRef);

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
   *  funcion para valdar campos validos
   */
  esCampoInvalido(campo: string): boolean {
    const control = this.sucursalesForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * @description
   * Funcion para mostrar mensaje de alerta.
   * @param mensaje 
   * @param tipo 
   */
  mostrarAlerta(mensaje: string, tipo: 'success' | 'danger'): void {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    
    // El mensaje desaparece solo después de 5 segundos
    setTimeout(() => {
      this.mensajeAlerta = null;
    }, 5000);
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
      this.mostrarAlerta('No realizado: Por favor, completa todos los campos obligatorios.', 'danger');
      return;
    }

    const formValues = this.sucursalesForm.value;

    const nombreExiste = this.sucursales.some(s => 
      s.nombre.toLowerCase() === formValues.nombre.toLowerCase() && s.id !== this.idEditando
    );

    if (nombreExiste) {
      this.mostrarAlerta('No realizado: Ya existe una sucursal con ese nombre.', 'danger');
      return;
    }

    if (this.modoEdicion && this.idEditando !== null) {
      // EDITAR
      const sucursalModificada: Sucursales = { id: this.idEditando, ...formValues };
      this.sucursalesService.editarSucursal(sucursalModificada).subscribe({
        next: (dataActualizada) => {
          this.sucursales = dataActualizada;
          this.cancelarEdicion();
          this.mostrarAlerta('Sucursal editada exitosamente.', 'success');
        },
        error: () => this.mostrarAlerta('No editado: Ocurrió un error al intentar modificar.', 'danger')
      });
    } else {
      // AGREGAR
      this.sucursalesService.agregarSucursal(formValues).subscribe({
        next: (dataActualizada) => {
          this.sucursales = dataActualizada;
          this.sucursalesForm.reset();
          this.mostrarAlerta('Sucursal agregada exitosamente.', 'success');
        },
        error: () => this.mostrarAlerta('No realizado: Ocurrió un error al guardar.', 'danger')
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
    this.mensajeAlerta = null;
    
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
        this.mostrarAlerta('Sucursal eliminada exitosamente.', 'success');
        
        if (this.idEditando === id) {
          this.cancelarEdicion();
        }
      });
    }
  }

  /**
   * @description
   * Llama a la funcion restaurar datos desde servicio y elimina datos,
   * muestra alertas según lo logrado.
   */
  restaurarDatosGP(): void {
    const confirmar = confirm(
      'Esta acción eliminará los cambios locales y se volverán a cargar los datos originales desde Github Pages. ¿Deseas continuar?'
    );

    if (!confirmar) {
      return;
    }

    this.cancelarEdicion();

    this.sucursalesService.restaurarDatosDesdeAPI().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.mostrarAlerta('Sucursales originales restauradas exitosamente.', 'success');
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.mostrarAlerta('Ocurrió un error al intentar restaurar los datos.', 'danger');
        console.error('Error restaurando sucursales:', err.message);
        this.cdr.detectChanges();
      }
    });
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
    this.tipoAlerta = null;
    this.mensajeAlerta = null;
  }
}