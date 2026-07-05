import { Component, inject } from '@angular/core'; // Removimos OnInit, OnDestroy y ChangeDetectorRef
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.services';
import { toSignal } from '@angular/core/rxjs-interop'; // <-- Importación clave de Angular

/**
 * @description
 * Componente que representa la barra de navegación principal (Navbar) de la aplicación.
 * Ahora utiliza Signals para una reactividad inmediata y óptima en el renderizado.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);

  

  // Convertimos el Observable Sesion$ directamente en un Signal reactivo.
  // Angular se encarga de suscribirse y desuscribirse automáticamente.
  sesion = toSignal(this.authService.Sesion$);

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
  }
}