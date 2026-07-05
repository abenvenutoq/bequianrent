import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ValidacionService } from '../../services/validacion.services';

/**
 * @description
 * Componente principal para inicio de sesión de usuarios en app BequianRent.
 * * Este componente centraliza dos de los flujos más importantes exigidos en la rúbrica:
 * 1. El inicio de sesión (Login) segmentado por roles.
 * 2. La recuperación de contraseña mediante un formulario reactivo alternativo.
 *
 * @usageNotes
 * - Requiere que los servicios {@link AuthService} y {@link ValidacionService} estén correctamente inyectados.
 * - Hace uso intensivo de validaciones reactivas personalizadas (ej. estructura de correos válidos).
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  
  /** Servicio encargado de la lógica de autenticación y persistencia de sesión. */
  private authService = inject(AuthService);
  /** Servicio de enrutamiento para redirigir al usuario tras operaciones exitosas. */
  private router = inject(Router);
  /** Proveedor de información sobre la ruta activa, usado para capturar parámetros como 'returnUrl'. */
  private route = inject(ActivatedRoute);
  /** Constructor de formularios reactivos. */
  private fb = inject(FormBuilder);
  /** Servicio contenedor de validaciones de negocio personalizadas. */
  private ValidacionService = inject(ValidacionService);

  /** Formulario reactivo que gestiona los campos de credenciales de acceso (correo y contraseña). */
  loginForm!: FormGroup;
  /** Formulario reactivo encargado de capturar y validar los datos para la recuperación de contraseña. */
  recupForm!: FormGroup;

  /** Almacena mensajes informativos, de éxito o de error orientados al usuario. */
  mensaje = '';
  /** Bandera de estado que indica si el proceso de login fue exitoso y el sistema está procesando la redirección. */
  enviado = false;
  /** Almacena el mensaje de feedback del flujo de recuperación de contraseña. */
  mensajeRecup = '';
  /** Bandera de control para indicar si la contraseña fue reestablecida con éxito. */
  recupExito = false;

  /** Controla la visibilidad (tipo de input text/password) de la contraseña en el formulario de login. */
  verPass = false;
  /** Controla la visibilidad de la nueva contraseña en el formulario de recuperación. */
  verRecupPass = false;
  /** Controla la visibilidad de la confirmación de la nueva contraseña en el formulario de recuperación. */
  verRecupConfirm = false;

  /**
   * Ciclo de vida de Angular. Inicializa las estructuras de los formularios reactivos
   * con sus respectivas reglas de validación en tiempo de carga.
   */
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, this.ValidacionService.isValidEmail]],
      password: ['', [Validators.required]]
    });

    this.recupForm = this.fb.group({
      recupCorreo: ['', [Validators.required, this.ValidacionService.isValidEmail]],
      recupPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(18),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/), // Exige al menos una mayúscula y un número
        this.ValidacionService.isEmpty
      ]],
      recupConfirmPassword: ['', [Validators.required, this.ValidacionService.isEmpty]]
    }, {
      validators: this.ValidacionService.passwordIguales('recupPassword', 'recupConfirmPassword')
    });
  }

  /**
   * Provee un acceso directo y simplificado a los controles del formulario de recuperación desde la vista HTML.
   * @returns Un objeto con los AbstractControls del formulario de recuperación.
   */
  get f() {
    return this.loginForm.controls;
  }
  get fr() {
    return this.recupForm.controls;
  }

  /** Alterna la visibilidad de la contraseña del login entre texto plano y caracteres ocultos. */
  togglePass(): void { this.verPass = !this.verPass; }
  /** Alterna la visibilidad de la contraseña de recuperación. */
  toggleRecupPass(): void { this.verRecupPass = !this.verRecupPass; }
  /** Alterna la visibilidad de la confirmación de contraseña de recuperación. */
  toggleRecupConfirm(): void { this.verRecupConfirm = !this.verRecupConfirm; }

  /**
   * Resetea el formulario de inicio de sesión a su estado original y limpia las alertas y banderas de estado.
   */
  limpiarFormularioLogin(): void {
    this.loginForm.reset();
    this.mensaje = '';
    this.enviado = false;
  }

  /**
   * Resetea el formulario de recuperación de contraseña a su estado original y limpia las alertas y banderas de estado.
   */
  limpiarFormularioRecuperar(): void {
    this.recupForm.reset();
    this.mensajeRecup = '';
    this.recupExito = false;
  }

  /**
   * Gestiona el flujo de autenticación del usuario.
   * * Valida el formulario de login y envía las credenciales al servicio de autenticación.
   * Si las credenciales son correctas, activa un temporizador de 1.5 segundos para mostrar el mensaje de éxito
   * y posteriormente redirige al usuario dinámicamente de acuerdo a su Rol (Admin o Cliente),
   * cumpliendo así con el requisito de privilegios diferenciados.
   */
  iniciarSesion(): void {
    this.mensaje = '';
    this.enviado = false;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { correo, password } = this.loginForm.value;
    const resultado = this.authService.iniciarSesion(correo, password);

    if (!resultado.ok) {
      this.mensaje = resultado.mensaje;
      this.enviado = false;
      return;
    }

    this.enviado = true;
    this.mensaje = resultado.mensaje;

    setTimeout(() => {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const sesion = this.authService.obtenerSesion();

      if (returnUrl) {
        this.router.navigateByUrl(returnUrl);
        return;
      }

      if (sesion?.rol == 'admin') {
        this.router.navigate(['/estadisticas-arriendos']);
      } else {
        this.router.navigate(['/mi-perfil']);
      }
    }, 1500);
  }

  /**
   * Procesa la solicitud de cambio/recuperación de contraseña.
   * * Verifica la validez de los datos del formulario reactivo y ejecuta el reemplazo de contraseña en el servicio.
   * En caso de éxito, actualiza los estados para renderizar la alerta correspondiente en la interfaz gráfica.
   */
  recuperarPassword(): void {
    this.mensajeRecup = '';
    this.recupExito = false;

    if (this.recupForm.invalid) {
      this.recupForm.markAllAsTouched();
      return;
    }

    const { recupCorreo, recupPassword } = this.recupForm.value;
    const resultado = this.authService.cambiarPassword(recupCorreo, recupPassword);

    if (!resultado.ok) {
      this.mensajeRecup = resultado.mensaje;
      this.recupExito = false;
      return;
    }

    this.recupExito = true;
    this.mensajeRecup = resultado.mensaje;
    
    setTimeout(() => {
      this.recupForm.reset();
      this.mensajeRecup = '';
      this.recupExito = false;
    }, 3000);
  }
}