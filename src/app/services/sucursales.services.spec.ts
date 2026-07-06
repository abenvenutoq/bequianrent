import { TestBed } from '@angular/core/testing';

import { SucursalesService } from './sucursales.services';

describe('Sucursales', () => {
  let service: SucursalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SucursalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
