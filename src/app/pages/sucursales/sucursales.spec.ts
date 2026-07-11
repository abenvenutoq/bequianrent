import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SucursalesComponent } from './sucursales';

/**
 * @description
 * Pruebas unitarias para el componente Sucursal.
 * Estas pruebas verifican la creación del componente y su funcionalidad básica.
 */
describe('Sucursal', () => {
  let component: SucursalesComponent;
  let fixture: ComponentFixture<SucursalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SucursalesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SucursalesComponent);
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
