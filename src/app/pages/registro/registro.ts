import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.services';
import { ValidacionService } from '../../services/validacion.services';

/**
 * @description
 * Componente encargado del registro de nuevos usuarios en la plataforma BequianRent.
 * Implementa un formulario reactivo robusto con múltiples validaciones de negocio,
 * garantizando la integridad y seguridad de los datos antes de guardarlos.
 *
 * @usageNotes
 * - Hace uso del `ValidacionService` para validar campos críticos como el RUT chileno,
 * la edad mínima (13 años) y las reglas de seguridad de contraseñas exigidas en la rúbrica.
 */
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnInit {

  /** Servicio para manejar la creación del usuario en la base de datos local/estado */
  private authService = inject(AuthService);
  /** Servicio para redirigir al usuario al login tras un registro exitoso */
  private router = inject(Router);
  /** Creador de formularios reactivos */
  private fb = inject(FormBuilder);
  /** Servicio de validaciones personalizadas (RUT, edad, espacios vacíos, etc.) */
  private ValidacionService = inject(ValidacionService);

  /** Formulario reactivo que agrupa todos los datos del nuevo usuario */
  registroForm!: FormGroup;

  /** Almacena el mensaje de retroalimentación positiva al registrarse */
  mensajeExito = '';
  /** Almacena el mensaje de error devuelto por el servicio (ej. correo duplicado) */
  mensajeError = '';
  /** Bandera para alternar la visibilidad de la contraseña en el DOM */
  verPass = false;
  /** Bandera para alternar la visibilidad del campo de confirmación de contraseña */
  verConfirm = false;

  /**
   * Ciclo de vida inicial del componente.
   * Construye el formulario reactivo y asigna los validadores a cada campo.
   */
  ngOnInit(): void {

    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(1), this.ValidacionService.isEmpty]],
      apellido: ['', [Validators.required, Validators.minLength(1), this.ValidacionService.isEmpty]],
      rut: ['', [Validators.required, this.ValidacionService.validarRutChileno()]],
      correo: ['',[Validators.required, this.ValidacionService.isValidEmail]],
      fechaNacimiento: ['', [Validators.required, this.ValidacionService.validarEdad(13)]],
      direccion: ['', [this.ValidacionService.validDireccion]],
      // Validaciones de seguridad exigidas para la contraseña
      password: ['',[
        Validators.required,
        Validators.minLength(6), // Minimo 6 carácteres
        Validators.maxLength(18), // Maximo 18 carácteres
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/), // Requerido 1 Mayuscula, 1 numero y 1 carácter especial. 
        this.ValidacionService.isEmpty
      ]],
      confirmPassword: ['', [Validators.required, this.ValidacionService.isEmpty]]
    }, {
      // Validador a nivel de grupo para asegurar que ambas contraseñas sean idénticas
      validators: this.ValidacionService.passwordIguales('password', 'confirmPassword')
    });

  }

  /**
   * Scceder fácilmente a los controles del formulario desde la vista HTML.
   */
  get f() {
    return this.registroForm.controls;
  }

  /** Muestra y oculta la password en el input */
  togglePass(): void { this.verPass = !this.verPass;}
  /** Muestra y oculta la confirmación de password en el input */
  toggleConfirm(): void { this.verConfirm = !this.verConfirm}

  /**
   * Resetea el formulario a su estado original (vacío) y limpia los mensajes de alerta.
   */
  limpiarFormulario(): void {
    this.registroForm.reset();
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  /**
   * Procesa el intento de registro.
   * - Si el formulario es inválido, marca todos los campos como tocados para mostrar los errores en la UI.
   * - Si es válido, envía los datos al `AuthService`.
   * - En caso de éxito, redirige al usuario a la vista de inicio de sesión tras 2.5 segundos.
   */
  registrar(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if ( this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const formValues = this.registroForm.value;
    
    const resultado = this.authService.registrar(
      formValues.nombre,
      formValues.apellido,
      formValues.rut,
      formValues.correo,
      formValues.fechaNacimiento,
      formValues.direccion || '',
      formValues.password
    );

    if (!resultado.ok) {
      this.mensajeError = resultado.mensaje;
      return;
    }
    
    this.mensajeExito = resultado.mensaje;
    // Retraso para que el usuario pueda leer el mensaje de éxito antes de navegar
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2500);
  }
}