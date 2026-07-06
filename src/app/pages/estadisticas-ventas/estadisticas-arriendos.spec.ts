import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEstadisticaVenta } from './estadisticas-arriendos';
import { EstadisticaService } from '../../services/estadisticas.services';

describe('EstadisticasVentas', () => {
  let component: EstadisticaService;
  let fixture: ComponentFixture<EstadisticaService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticaService],
    }).compileComponents();

    fixture = TestBed.createComponent(EstadisticaService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
