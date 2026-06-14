import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { AuthService } from '../../services/auth.services.';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  correo = '';
  password = '';

  mensaje = '';
  enviado = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  iniciarSesion(): void {
    if (!this.correo || !this.password) {
      this.mensaje = 'Por favor, completa todos los campos.';
      this.enviado = false;
      return;
    }

    const resultado = this.authService.iniciarSesion(this.correo, this.password);

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

      if (sesion?.rol === 'admin') {
        this.router.navigate(['/admin-panel']);
      } else {
        this.router.navigate(['/']);
      }
    }, 1500);
  }
}