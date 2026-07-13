import { TestBed } from '@angular/core/testing';

import { VehiculosJsonServerService } from './vehiculos-json-server.services';

describe('VehiculosJsonServerService', () => {
  let service: VehiculosJsonServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehiculosJsonServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
