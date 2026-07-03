import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculosTablaComponent } from './vehiculos-tabla';

/** @description Tests para VehiculosTablaComponent */
describe('VehiculosTabla', () => {
  let component: VehiculosTablaComponent;
  let fixture: ComponentFixture<VehiculosTablaComponent>;

  /** @description Configuración inicial para los tests */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculosTablaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiculosTablaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  /** @description Verifica que el componente se cree correctamente */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
