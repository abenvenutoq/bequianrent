import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../../../models/modelos';

/**
 * @description
 * Componente que representa la tabla de usuarios en el panel de administración.
 * Permite mostrar la lista de usuarios y eliminar un usuario.
 */
@Component({
  selector: 'app-usuarios-tabla',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios-tabla.html',
  styleUrl: './usuarios-tabla.css',
})
/**
 * @description
 * Clase que implementa la lógica del componente UsuariosTablaComponent.
 * Se encarga de construir el formulario reactivo para la lista de usuarios y manejar la eliminación de usuarios.
 */
export class UsuariosTablaComponent implements OnInit {
  @Input() listaUsuarios: Usuario[] = [];
  @Output() onUsuarioEliminado = new EventEmitter<Usuario>();

  /**
   * @description
   * Constructor del componente UsuariosTablaComponent.
   * Inicializa el FormBuilder para construir el formulario reactivo.
   */
  private fb = inject(FormBuilder);
  adminForm!: FormGroup;
  
  /**
   * @description
   * Método que se ejecuta al inicializar el componente.
   * Construye el formulario reactivo para la lista de usuarios.
   */
  ngOnInit(): void {
    this.adminForm = this.fb.group({
      usuariosControls: this.fb.array([])
    });

    this.construirFormulario();
  }

  /**
   * @description
   * Getter que devuelve el FormArray de usuarios del formulario reactivo.
   * Permite acceder a los controles de cada usuario en la lista.
   * @returns {FormArray} El FormArray de usuarios.
   */
  get usuariosFormArray(): FormArray {
    return this.adminForm.get('usuariosControls') as FormArray;
  }

  /**
   * @description
   * Método privado que construye el formulario reactivo para la lista de usuarios.
   * Crea un grupo de controles para cada usuario y los agrega al FormArray.
   * Cada grupo de controles contiene los campos del usuario: id, nombre, apellido, rut, correo, fechaNacimiento, direccion y rol.
   */
  private construirFormulario(): void {
    this.listaUsuarios.forEach(usuario => {
      const grupo = this.fb.group({
        id: [usuario.id],
        nombre: [usuario.nombre],
        apellido: [usuario.apellido],
        rut: [usuario.rut],
        correo: [usuario.correo],
        fechaNacimiento: [usuario.fechaNacimiento],
        direccion: [usuario.direccion],
        rol: [usuario.rol]
      });

      this.usuariosFormArray.push(grupo);
    });
  }

  /**
   * @description (DE MOMENTO SIN USO)
   * Método que elimina un usuario de la lista.
   * Emite un evento con el usuario eliminado.
   * @param usuario El usuario a eliminar.
   */
  eliminarUsuario(usuario: Usuario): void {
    this.onUsuarioEliminado.emit(usuario);
  }
}
