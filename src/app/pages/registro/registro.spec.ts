import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';


import { Registro } from './registro';
import { AuthService } from '../../services/auth.services';

describe('Pruebas Unitarias - Componente Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;

  // Creación de mocks
  const mockAuthService = { 
    registrar: () => ({ ok: true, mensaje: 'Éxito' }) 
  };
  
  const mockRouter = { 
    navigate: () => {} 
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registro, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  // Test para validad que sea mayor de 13 años.
  it('Debe invalidar el formulario si la persona es menor de 13 años', () => {
    const controlFecha = component.registroForm.get('fechaNacimiento');

    const hoy = new Date();
    const hace5Anios = new Date(hoy.getFullYear() - 5, hoy.getMonth(), hoy.getDate());
    
    controlFecha?.setValue(hace5Anios.toISOString().split('T')[0]);

    expect(controlFecha?.valid).toBeFalsy();
    expect(controlFecha?.errors?.['menorDeEdad']).toBeTruthy();
  });

  // Test para que las contraseñas sean iguales.
  it('Debe invalidar el formulario si las contraseñas no coinciden', () => {
    const pass = component.registroForm.get('password');
    const confirmPass = component.registroForm.get('confirmPassword');

    pass?.setValue('Abcd.1234');
    confirmPass?.setValue('TotalmenteDistinta.99');

    component.registroForm.updateValueAndValidity();

    expect(confirmPass?.errors?.['noCoinciden']).toBeTruthy();
    expect(component.registroForm.valid).toBeFalsy();
  });
});