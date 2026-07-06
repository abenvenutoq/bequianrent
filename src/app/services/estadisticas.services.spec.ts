import { TestBed } from '@angular/core/testing';

import { EstadisticaService } from './estadisticas.services';

/**
 * @description
 * Pruebas unitarias para el servicio EstadisticaService.
 * Estas pruebas verifican la creación del servicio y su funcionalidad básica.
 */
describe('Estadisticas', () => {
  let service: EstadisticaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadisticaService);
  });

  
  /**
   * @test 1. Verifica que el servicio se haya creado correctamente
   * Esta prueba asegura que la instancia del servicio EstadisticaService se haya inicializado sin errores.
   * Se espera que la instancia no sea nula ni indefinida.
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
