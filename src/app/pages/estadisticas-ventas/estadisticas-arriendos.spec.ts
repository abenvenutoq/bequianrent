import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEstadisticaVenta } from './estadisticas-arriendos';

/**
 * @description
 * Pruebas unitarias para el componente AdminEstadisticaVenta.
 * Estas pruebas verifican la creación del componente y su funcionalidad básica.
 */
describe('EstadisticasVentas', () => {
  let component: AdminEstadisticaVenta;
  let fixture: ComponentFixture<AdminEstadisticaVenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEstadisticaVenta],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEstadisticaVenta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  /**
   * @description
   * Prueba que verifica que el componente se cree correctamente.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
