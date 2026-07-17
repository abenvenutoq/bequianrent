import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { clienteGuard } from './cliente.guard';
import { AuthService } from '../services/auth.services';
import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * @description
 * Suite de pruebas unitarias para el guard {@link clienteGuard}.
 * Verifica que el guard permita o bloquee el acceso a rutas según si el usuario es cliente o no.
 * También verifica que se redirija al login cuando corresponda.
 */
describe('Pruebas unitarias para clienteGuard', () => {

    let routerSpy: any;
    let authServiceSpy: any;
    
    let mockRoute: ActivatedRouteSnapshot;
    let mockState: RouterStateSnapshot;

    /**
     * @description
     * Antes de cada prueba, configuramos los espías (mocks) para Router y AuthService.
     * Esto nos permite simular el comportamiento de estos servicios sin depender de su implementación real.
     */
    beforeEach(() => {
        routerSpy = {
            navigate: vi.fn() 
        };
        authServiceSpy = {
            esCliente: vi.fn(),
            esAdmin: vi.fn()
        };

        mockRoute = {} as ActivatedRouteSnapshot;
        mockState = { url: '/mi-cuenta' } as RouterStateSnapshot;

        /** Configuramos el Testbed de Angular para inyectar los espias en lugar de los servicios reales 
         * Esto nos permite controlar el comportamiento de los servicios durante las pruebas.
         */
        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: routerSpy }, 
                { provide: AuthService, useValue: authServiceSpy }
            ]
        });
    });

    /** @test Prueba que permite el paso si el usuario es cliente */
    it('Debe permitir el paso (retornar true) si el usuario es Cliente', () => {
        authServiceSpy.esCliente.mockReturnValue(true);
        authServiceSpy.esAdmin.mockReturnValue(false);
        
        const resultado = TestBed.runInInjectionContext(() => clienteGuard(mockRoute, mockState));

        expect(resultado).toBe(true);
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    /** @test Prueba que bloquea el paso y redirige al login si el usuario no es cliente */
    it('Debe redirigir al login (retornar false) si el usuario no es Cliente ni Admin', () => {
        authServiceSpy.esCliente.mockReturnValue(false);
        authServiceSpy.esAdmin.mockReturnValue(false);

        const resultado = TestBed.runInInjectionContext(() => clienteGuard(mockRoute, mockState));

        expect(resultado).toBe(false);
        expect(routerSpy.navigate).toHaveBeenCalledWith(
            ['/login'], 
            { queryParams: { returnUrl: '/mi-cuenta' } }
        );
    });

});