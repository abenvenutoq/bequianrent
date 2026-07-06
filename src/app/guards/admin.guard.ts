import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.services'; 


/**
 * @description
 * Guard para protección doble en paginas solo para administrador
 */
export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);


  /** @description Verifica si el usuario es administrador */
  if (authService.esAdmin()) {
    return true; 
  }

  /** @description Si es cliente, redirige a la página principal */
  if (authService.esCliente()) {
    router.navigate(['/']);
    return false;
  }

  /** @description Si no es admin redirige al login */
  router.navigate(['/login']);
  return false;
};