import { TestBed } from '@angular/core/testing';

import { EstadisticaService } from './estadisticas.services';

describe('Estadisticas', () => {
  let service: EstadisticaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadisticaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
