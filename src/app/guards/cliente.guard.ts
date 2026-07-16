import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.services';

/**
 * @description
 * Guard para protección doble en paginas solo para cliente
 */
export const clienteGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    /** Verifica si el usuario es cliente */
    if (authService.esCliente() || authService.esAdmin()) {
        return true;
    }

    /** Redirige al login si el usuario no es cliente */
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
};