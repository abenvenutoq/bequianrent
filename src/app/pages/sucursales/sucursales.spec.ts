import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sucursal } from './sucursales';

/**
 * @description
 * Pruebas unitarias para el componente Sucursal.
 * Estas pruebas verifican la creación del componente y su funcionalidad básica.
 */
describe('Sucursal', () => {
  let component: Sucursal;
  let fixture: ComponentFixture<Sucursal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sucursal],
    }).compileComponents();

    fixture = TestBed.createComponent(Sucursal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  /** 
   * @Test 1. Verifica que el componente se haya creado correctamente
   * Esta prueba asegura que la instancia del componente Sucursal se haya inicializado sin errores.
   * Se espera que la instancia no sea nula ni indefinida.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
