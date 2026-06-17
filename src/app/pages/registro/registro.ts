import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.services.';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  registroForm!: FormGroup;

  mensajeExito = '';
  mensajeError = '';
  verPass = false;
  verConfirm = false;

  ngOnInit(): void {

    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      rut: ['', [Validators.required, this.validarRutChileno()]],
      correo: ['',[Validators.required, Validators.email]],
      fechaNacimiento: ['', [Validators.required, this.validarEdad(13)]],
      direccion: [''],
      password: ['',[
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(18),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordIguales
    });

  }

  get f() {
    return this.registroForm.controls;
  }

  togglePass(): void { this.verPass = !this.verPass;}
  toggleConfirm(): void { this.verConfirm = !this.verConfirm}

  limpiarFormulario(): void {
    this.registroForm.reset();
    this.mensajeExito = '';
    this.mensajeError = '';
  }

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
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2500);
  }

  validarEdad(edadMinima: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const fechaNac = new Date(control.value);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const m = hoy.getMonth() - fechaNac.getMonth();
      
      if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
      
      return edad < edadMinima ? { menorDeEdad: true } : null;
    };
  }


  validarRutChileno() {
    return (control: AbstractControl): ValidationErrors | null => {
      const rutCompleto = control.value;
      
      // Si el campo está vacío, no lo validamos aquí (de eso se encarga Validators.required)
      if (!rutCompleto) return null; 

      // Validación de formato básico
      if (!/^[0-9]+-[0-9kK]{1}$/.test(rutCompleto)) return { rutInvalido: true };
      
      const partes = rutCompleto.split("-");
      const cuerpo = partes[0];
      const dvIngresado = partes[1].toLowerCase();
      
      // Calcular dígito verificador esperado
      let suma = 0;
      let multiplicador = 2;
      
      for (let i = cuerpo.length - 1; i >= 0; i--) {
          suma += parseInt(cuerpo.charAt(i)) * multiplicador;
          multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
      }
      
      let dvEsperado: string | number = 11 - (suma % 11);
      if (dvEsperado === 11) dvEsperado = "0";
      else if (dvEsperado === 10) dvEsperado = "k";
      else dvEsperado = dvEsperado.toString();
      
      // Si coinciden, devolvemos null (sin errores). Si no, devolvemos el error.
      return dvIngresado === dvEsperado ? null : { rutInvalido: true };
    };
  }

  passwordIguales(group: AbstractControl): ValidationErrors | null {

    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;

    if (pass && confirmPass && pass !== confirmPass) {
      group.get('confirmPassword')?.setErrors({ noCoinciden: true});
      return { noCoinciden: true}
    }

    return null;

  }

}