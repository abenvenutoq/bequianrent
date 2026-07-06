import { TestBed } from '@angular/core/testing';

import { TestimoniosService } from './testimonios.services';

/**
 * @description
 * Pruebas unitarias para el servicio TestimoniosService.
 * Estas pruebas verifican la creación del servicio y su funcionalidad básica.
 */
describe('Testimonios', () => {
  let service: TestimoniosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestimoniosService);
  });

  /**
   * @test 1. Verifica que el servicio se haya creado correctamente
   * Esta prueba asegura que la instancia del servicio TestimoniosService se haya inicializado sin errores.
   * Se espera que la instancia no sea nula ni indefinida.
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
