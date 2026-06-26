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


  if (authService.esAdmin()) {
    return true; 
  }

  /** Si no es admin redirige al login */
  router.navigate(['/login']);
  return false;
};