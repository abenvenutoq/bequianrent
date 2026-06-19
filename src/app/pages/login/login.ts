import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ValidacionService } from '../../services/validacion.services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private ValidacionService = inject(ValidacionService);

  loginForm!: FormGroup;
  recupForm!: FormGroup;

  mensaje = '';
  enviado = false;
  mensajeRecup = '';
  recupExito = false;

  verPass = false;
  verRecupPass = false;
  verRecupConfirm = false;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.recupForm = this.fb.group({
      recupCorreo: ['', [Validators.required, Validators.email]],
      recupPassword: ['', [Validators.required, 
        Validators.minLength(6),
        Validators.maxLength(18),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      recupConfirmPassword: ['', [Validators.required]]
    }, {
      validators: this.ValidacionService.passwordIguales
    });
  }

  get f() { return this.loginForm.controls; }
  get fr() { return this.recupForm.controls; }

  togglePass(): void { this.verPass = !this.verPass; }
  toggleRecupPass(): void { this.verRecupPass = !this.verRecupPass; }
  toggleRecupConfirm(): void { this.verRecupConfirm = !this.verRecupConfirm; }

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
        this.router.navigate(['/admin-panel']);
      } else {
        this.router.navigate(['/mi-perfil']);
      }
    }, 1500);
  }

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
      const modalElement = document.getElementById('modalRecuperar');
      if (modalElement) {
        const bootstrap = (window as any).bootstrap;
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
      }
    }, 2000);
  }
   
}