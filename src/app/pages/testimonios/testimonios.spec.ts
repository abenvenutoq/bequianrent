import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Testimonio } from './testimonios';

/**
 * @description
 * Pruebas unitarias para el componente Testimonio.
 * Estas pruebas verifican la creación del componente y su funcionalidad básica.
 */
describe('Testimonios', () => {
  let component: Testimonio;
  let fixture: ComponentFixture<Testimonio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Testimonio],
    }).compileComponents();

    fixture = TestBed.createComponent(Testimonio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  /** 
   * @Test 1. Verifica que el componente se haya creado correctamente
   * Esta prueba asegura que la instancia del componente Testimonio se haya inicializado sin errores.
   * Se espera que la instancia no sea nula ni indefinida.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
