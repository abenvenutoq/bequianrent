import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.services';
import { ValidacionService } from '../../services/validacion.services';

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
  private ValidacionService = inject(ValidacionService);

  registroForm!: FormGroup;

  mensajeExito = '';
  mensajeError = '';
  verPass = false;
  verConfirm = false;

  ngOnInit(): void {

    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(1), this.ValidacionService.isEmpty]],
      apellido: ['', [Validators.required, Validators.minLength(1), this.ValidacionService.isEmpty]],
      rut: ['', [Validators.required, this.ValidacionService.validarRutChileno()]],
      correo: ['',[Validators.required, this.ValidacionService.isValidEmail]],
      fechaNacimiento: ['', [Validators.required, this.ValidacionService.validarEdad(13)]],
      direccion: [''],
      password: ['',[
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(18),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
        this.ValidacionService.isEmpty
      ]],
      confirmPassword: ['', [Validators.required, this.ValidacionService.isEmpty]]
    }, {
      validators: this.ValidacionService.passwordIguales('password', 'confirmPassword')
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
}