import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.services';
import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * @description
 * Suite de pruebas unitarias para el guard {@link adminGuard}.
 * Verifica que el guard permita o bloquee el acceso a rutas según si el usuario es administrador o no.
 * También verifica que se redirija al login cuando corresponda.
 */
describe('Pruebas unitarias para adminGuard', () => {
  let routerSpy: any;
  let authServiceSpy: any;

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
      esAdmin: vi.fn(),
      esCliente: vi.fn()
    };


    /**
     * Configuramos el TestBed de Angular para inyectar los espías en lugar de las implementaciones reales.
     * Esto nos permite controlar el comportamiento de los servicios durante las pruebas.
     */
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
  });

  /** @test Prueba que permite el paso si el usuario es administrador */
  it('Debe permitir el paso (retornar true) si el usuario es Administrador', () => {
    authServiceSpy.esAdmin.mockReturnValue(true);

    const resultado = TestBed.runInInjectionContext(() => adminGuard());

    expect(resultado).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  /** @test Prueba que bloquea el paso y redirige al login si el usuario no es administrador */
  it('Debe bloquear el paso (retornar false) y redirigir al /login si el usuario NO es Administrador', () => {
    authServiceSpy.esAdmin.mockReturnValue(false);

    const resultado = TestBed.runInInjectionContext(() => adminGuard());
    
    expect(resultado).toBe(false); 
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});