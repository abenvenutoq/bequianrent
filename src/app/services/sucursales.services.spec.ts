import { TestBed } from '@angular/core/testing';

import { SucursalesService } from './sucursales.services';

/**
 * @description
 * Pruebas unitarias para el servicio SucursalesService.
 * Estas pruebas verifican la creación del servicio y su funcionalidad básica.
 */
describe('Sucursales', () => {
  let service: SucursalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SucursalesService);
  });

  /**
   * @test 1. Verifica que el servicio se haya creado correctamente
   * Esta prueba asegura que la instancia del servicio SucursalesService se haya inicializado sin errores.
   * Se espera que la instancia no sea nula ni indefinida.
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
