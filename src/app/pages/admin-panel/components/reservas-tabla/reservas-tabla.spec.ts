import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasTablaComponent } from './reservas-tabla';

/** @description Tests para ReservasTablaComponent */
describe('ReservasTabla', () => {
  let component: ReservasTablaComponent;
  let fixture: ComponentFixture<ReservasTablaComponent>;

  /** @description Configuración inicial para los tests */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasTablaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservasTablaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  /** @description Verifica que el componente se cree correctamente */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
