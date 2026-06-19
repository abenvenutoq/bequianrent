import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.services';
import { Usuario } from '../../models/modelos';
import { ValidacionService } from '../../services/validacion.services';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private ValidacionService = inject(ValidacionService);

  usuario: Usuario | null = null;
  editando = false;

  perfilForm!: FormGroup;

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
      return;
    }
    

    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, this.ValidacionService.isEmpty]],
      apellido: ['', [Validators.required, this.ValidacionService.isEmpty]],
      fechaNacimiento: ['', [Validators.required, this.ValidacionService.validarEdad(13)]],
      direccion: [''],
      password: ['', [
        Validators.required, 
        Validators.minLength(6), 
        Validators.maxLength(18), 
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
        this.ValidacionService.isEmpty
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.ValidacionService.passwordIguales
    });
  }

  get f() {
    return this.perfilForm.controls;
  }

  togglePass(): void {
    this.verPass = !this.verPass;
  }

  toggleConfirm(): void {
    this.verConfirm = !this.verConfirm;
  }

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

  cancelarEdicion(): void {
    this.editando = false;
  }

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
      
      setTimeout(() => {
        this.editando = false;
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
            this.router.navigate(['/mi-perfil']);
        });
      }, 1500);
    }
  }

}