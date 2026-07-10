import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenedorSucursales } from './mantenedor-sucursales';

describe('MantenedorSucursales', () => {
  let component: MantenedorSucursales;
  let fixture: ComponentFixture<MantenedorSucursales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenedorSucursales],
    }).compileComponents();

    fixture = TestBed.createComponent(MantenedorSucursales);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
