import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.services.';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  nombre = '';
  apellido = '';
  rut = '';
  correo = '';
  telefono = '';
  direccion = '';
  password = '';
  confirmPassword = '';

  mensajeExito = '';
  mensajeError = '';

  verPass = false;
  verConfirm = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePass(): void {
    this.verPass = !this.verPass;
  }

  toggleConfirm(): void {
    this.verConfirm = !this.verConfirm;
  }

  limpiarFormulario(form?: any): void {
    this.nombre = '';
    this.apellido = '';
    this.rut = '';
    this.correo = '';
    this.telefono = '';
    this.direccion = '';
    this.password = '';
    this.confirmPassword = '';
    this.mensajeExito = '';
    this.mensajeError = '';
    
    if (form) {
      form.resetForm();
    }
  }

  registrar(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.password !== this.confirmPassword) {
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }

    const resultado = this.authService.registrar(
      this.nombre,
      this.apellido,
      this.rut,
      this.correo,
      this.telefono,
      this.direccion,
      this.password
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