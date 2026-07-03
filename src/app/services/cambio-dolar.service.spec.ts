import { TestBed } from '@angular/core/testing';

import { TipoCambioService } from './cambio-dolar.service';

/**
 * @description
 * Suite de Pruebas Unitarias para el servicio {@link TipoCambioService}.
 * Verifica la correcta creación del servicio y su inyección en el contexto de pruebas.
 */
describe('TipoCambioService', () => {
  let service: TipoCambioService;

  /**
   * @description
   * Antes de cada prueba, configuramos el TestBed de Angular y obtenemos una instancia del servicio.
   * Esto asegura que cada prueba tenga un contexto limpio y aislado.
   */
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoCambioService);
  });

  /**
   * @description
   * Verifica que el servicio se cree correctamente.
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
