import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosTablaComponent } from './usuarios-tabla';

/** @description Tests para UsuariosTablaComponent */
describe('UsuariosTabla', () => {
  let component: UsuariosTablaComponent;
  let fixture: ComponentFixture<UsuariosTablaComponent>;

  /** @description Configuración inicial para los tests */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosTablaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosTablaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  /** @description Verifica que el componente se cree correctamente */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
