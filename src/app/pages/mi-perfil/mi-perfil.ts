import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.services.';
import { Usuario } from '../../models/modelos';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario: Usuario | null = null;
  editando = false;

  nombreEdit = '';
  apellidoEdit = '';
  fechaNacimientoEdit = '';
  direccionEdit = '';
  passwordEdit = '';
  confirmPasswordEdit = '';

  mensajeError = '';
  mensajeExito = '';

  verPass = false;
  verConfirm = false;

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
    }
  }

  togglePass(): void {
    this.verPass = !this.verPass;
  }

  toggleConfirm(): void {
    this.verConfirm = !this.verConfirm;
  }

  activarEdicion(): void {
    if (this.usuario) {
      this.nombreEdit = this.usuario.nombre;
      this.apellidoEdit = this.usuario.apellido;
      this.fechaNacimientoEdit = this.usuario.fechaNacimiento;
      this.direccionEdit = this.usuario.direccion;
      this.passwordEdit = this.usuario.password;
      this.confirmPasswordEdit = this.usuario.password;
      
      this.mensajeError = '';
      this.mensajeExito = '';
      this.editando = true;
    }
  }

  cancelarEdicion(): void {
    this.editando = false;
  }

  guardarCambios(): void {
    if (!this.usuario) return;

    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.passwordEdit !== this.confirmPasswordEdit) {
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }

    const usuarios = this.authService.obtenerUsusario();
    const index = usuarios.findIndex(u => u.id === this.usuario!.id);

    if (index !== -1) {
      usuarios[index].nombre = this.nombreEdit;
      usuarios[index].apellido = this.apellidoEdit;
      usuarios[index].fechaNacimiento = this.fechaNacimientoEdit;
      usuarios[index].direccion = this.direccionEdit;
      usuarios[index].password = this.passwordEdit;

      this.authService.guardarUsuario(usuarios);

      this.usuario = usuarios[index];
      
      this.mensajeExito = '¡Datos y contraseña actualizados con éxito!';
      
      setTimeout(() => {
        this.editando = false;
        this.router.navigate(['/mi-perfil']);
      }, 1500);
    }
  }
}