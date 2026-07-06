import { TestBed } from '@angular/core/testing';

import { TestimoniosService } from './testimonios.services';

describe('Testimonios', () => {
  let service: TestimoniosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestimoniosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
