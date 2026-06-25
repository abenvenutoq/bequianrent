import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.services'; // Ajusta la ruta a tu servicio

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Reutilizamos tu función estrella ⭐
  if (authService.esAdmin()) {
    return true; // Lo dejamos pasar sin problemas
  }

  // Si no es admin, bloqueamos la entrada y lo mandamos al login
  router.navigate(['/login']);
  return false;
};