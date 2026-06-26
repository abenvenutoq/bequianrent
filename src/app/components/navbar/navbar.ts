import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Sesion } from '../../models/modelos';
import { AuthService } from '../../services/auth.services';

/**
 * @description
 * Componente que representa la barra de navegación principal (Navbar) de la aplicación.
 * * Funcionalidades principales:
 * - Se suscribe de forma reactiva al estado de la sesión (`Sesion$`) provisto por el `AuthService`.
 * - Actualiza dinámicamente las opciones del menú (ej. mostrar "Iniciar Sesión" vs "Mi Perfil" / "Cerrar Sesión") según si el usuario está logueado o no.
 * - Gestiona el cierre de sesión seguro y redirige a la página principal.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  /** Servicio centralizado de autenticación para consultar y modificar el estado de la sesión. */
  private authService = inject(AuthService);
  /** Servicio de enrutamiento para navegar tras el cierre de sesión. */
  private router = inject(Router);
  /** * Servicio de detección de cambios de Angular. 
   * Se inyecta para forzar el repintado de la vista cuando el observable emite un cambio de sesión.
   */
  private cdr = inject(ChangeDetectorRef);

  /** * Almacena la información del usuario logueado actualmente. 
   * Si es `null`, significa que no hay ninguna sesión activa (modo visitante).
   */
  sesion: Sesion | null = null;

  /** * Referencia a la suscripción activa del observable de sesión.
   * Se guarda en memoria para poder destruirla cuando el componente se desmonte.
   */
  private sesionSub!: Subscription;

  /**
   * Ciclo de vida de inicialización.
   * Se suscribe al `BehaviorSubject` del servicio de autenticación. Cada vez que ocurre un inicio 
   * o cierre de sesión en cualquier parte de la app, este bloque recibe los nuevos datos y le indica 
   * explícitamente a Angular que detecte los cambios (`detectChanges`) para actualizar el HTML del menú.
   */
  ngOnInit(): void {

    this.sesionSub = this.authService.Sesion$.subscribe({
      next: (datosSesion) => {
        this.sesion = datosSesion;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Finaliza la sesión actual del usuario.
   * 1. Llama al método de limpieza en el `AuthService` (borrando LocalStorage/SessionStorage y actualizando el Observable).
   * 2. Redirige al usuario a la vista pública principal (raíz `/`).
   */
  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
  }

  /**
   * Ciclo de vida de destrucción del componente.
   * * Importante: Corta la suscripción al observable (`unsubscribe()`) para prevenir fugas de memoria (memory leaks)
   * o comportamientos inesperados si el componente Navbar llegara a ser destruido y recreado.
   */
  ngOnDestroy(): void {
    if (this.sesionSub) {
      this.sesionSub.unsubscribe();
    }
  }
}