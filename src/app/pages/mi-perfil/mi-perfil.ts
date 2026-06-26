import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AuthService } from '../../services/auth.services';
import { Usuario } from '../../models/modelos';
import { ValidacionService } from '../../services/validacion.services';

/**
 * @description
 * Componente que gestiona la vista del perfil de usuario (`MiPerfil`).
 * Permite visualizar la información de la cuenta activa y habilita un modo de edición
 * para actualizar los datos personales, validando en tiempo real las reglas de negocio
 * (RUT, edad mínima y contraseñas) mediante un formulario reactivo.
 */
@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {

  /** Servicio que provee las funciones de autenticación y gestión de usuarios. */
  private authService = inject(AuthService);
  /** Servicio de enrutamiento de Angular para proteger la ruta si no hay sesión. */
  private router = inject(Router);
  /** Creador de formularios reactivos. */
  private fb = inject(FormBuilder);
  /** Servicio centralizado que provee las validaciones de negocio personalizadas. */
  private ValidacionService = inject(ValidacionService);

  /** Objeto que almacena los datos en duro del usuario actualmente logueado. */
  usuario: Usuario | null = null;
  /** flag que controla si la vista está en modo lectura o en modo edición de formulario. */
  editando = false;

  /** Formulario reactivo principal para la actualización de datos del perfil. */
  perfilForm!: FormGroup;

  /** Mensaje de retroalimentación en caso de ocurrir un error en el guardado. */
  mensajeError = '';
  /** Mensaje de retroalimentación visual de éxito al guardar. */
  mensajeExito = '';

  /** Controla la visibilidad (tipo text/password) del input de la contraseña principal. */
  verPass = false;
  /** Controla la visibilidad (tipo text/password) del input de confirmación de contraseña. */
  verConfirm = false;

  /**
   * Ciclo de vida inicial del componente.
   * * Ejecuta las siguientes acciones críticas:
   * 1. Bloquea la ejecución en SSR usando `isBrowser()`.
   * 2. Protege la vista validando que exista una sesión activa; de lo contrario, expulsa al login.
   * 3. Recupera los datos reales del usuario mediante una búsqueda en el almacenamiento local.
   * 4. Inicializa el formulario reactivo inyectándole los validadores estrictos.
   */
  ngOnInit(): void {
    if (!this.authService.isBrowser()){
      return;
    }

    const sesionActual = this.authService.obtenerSesion();
    if (!sesionActual || !sesionActual.loged) {
      this.router.navigate(['/login']);
      return;
    }

    const todosLosUsuarios = this.authService.obtenerUsusario();
    const usuarioEncontrado = todosLosUsuarios.find(u => u.correo === sesionActual.correo);

    if (usuarioEncontrado) {
      this.usuario = usuarioEncontrado;
    } else {
      this.authService.cerrarSesion();
      this.router.navigate(['/login']);
      return;
    }
    

    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, this.ValidacionService.isEmpty]],
      apellido: ['', [Validators.required, this.ValidacionService.isEmpty]],
      fechaNacimiento: ['', [Validators.required, this.ValidacionService.validarEdad(13)]],
      direccion: ['', [this.ValidacionService.validDireccion]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6), 
        Validators.maxLength(18), 
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
        this.ValidacionService.isEmpty
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.ValidacionService.passwordIguales('password', 'confirmPassword')
    });
  }

  /**
   * Getter auxiliar diseñado para limpiar el código HTML.
   * Facilita el acceso directo a los controles individuales del formulario (ej. `f['nombre'].errors`).
   * @returns Los controles subyacentes del `perfilForm`.
   */
  get f() {
    return this.perfilForm.controls;
  }

  /** Intercambia dinámicamente el estado de visibilidad de la contraseña principal en el DOM. */
  togglePass(): void {
    this.verPass = !this.verPass;
  }

  /** Intercambia dinámicamente el estado de visibilidad de la confirmación de contraseña. */
  toggleConfirm(): void {
    this.verConfirm = !this.verConfirm;
  }

  /**
   * Habilita el modo de edición de perfil.
   * Utiliza el método `patchValue` para inyectar y pre-rellenar los inputs del formulario
   * basándose en la información actual guardada en el estado local del componente.
   */
  activarEdicion(): void {
    if (this.usuario) {
      this.perfilForm.patchValue({
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        fechaNacimiento: this.usuario.fechaNacimiento,
        direccion: this.usuario.direccion,
        password: this.usuario.password,
        confirmPassword: this.usuario.password
      });
      
      this.mensajeError = '';
      this.mensajeExito = '';
      this.editando = true;
    }
  }

  /** Aborta el flujo de edición y retorna la vista al estado de solo lectura. */
  cancelarEdicion(): void {
    this.editando = false;
  }

  /**
   * Procesa la solicitud para guardar las modificaciones del usuario.
   * 1. Detiene la ejecución si el formulario posee estados inválidos (marcando todos los inputs como `touched`).
   * 2. Extrae los valores actualizados y busca el registro del usuario en la "Base de Datos" local.
   * 3. Sobrescribe la información, la persiste vía `AuthService` y actualiza la vista.
   * 4. Activa un temporizador visual (1.5 segundos) antes de cerrar automáticamente el modo edición.
   */
  guardarCambios(): void {
    if (!this.usuario) return;

    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    const formValues = this.perfilForm.value;
    const usuarios = this.authService.obtenerUsusario();
    const index = usuarios.findIndex(u => u.id === this.usuario!.id);

    if (index !== -1) {
      usuarios[index].nombre = formValues.nombre;
      usuarios[index].apellido = formValues.apellido;
      usuarios[index].fechaNacimiento = formValues.fechaNacimiento;
      usuarios[index].direccion = formValues.direccion || '';
      usuarios[index].password = formValues.password;

      this.authService.guardarUsuario(usuarios);
      this.usuario = usuarios[index];
      
      this.mensajeExito = '¡Datos y contraseña actualizados con éxito!';

      // Auto-cierra el modo edición tras un segundo y medio para mejorar la UX
      setTimeout(() => {
        this.editando = false;
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
            this.router.navigate(['/mi-perfil']);
        });
      }, 1500);

      
    }
  }

}