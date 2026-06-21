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

  // Test para el registro si el form es válido
  it('Debe ejecutar el registro correctamente si el formulario es válido', () => {
    component.registroForm.patchValue({
      nombre: 'Angelo',
      apellido: 'Benvenuto',
      rut: '15940700-4',
      correo: 'angelo@correo.com',
      fechaNacimiento: '1984-11-13',
      direccion: 'Av. Maria Elena 370',
      password: 'Password123',
      confirmPassword: 'Password123'
    });

    component.registrar();

    expect(component.mensajeExito).toBe('Éxito');
    expect(component.mensajeError).toBe('');
  });

  // Test para invalidar el registro si el correo ya existe
  it('Debe mostrar un mensaje de error si el registro falla (ej. correo ya existe)', () => {
    component.registroForm.patchValue({
      nombre: 'Angelo',
      apellido: 'Benvenuto',
      rut: '15940700-4', 
      correo: 'correo_duplicado@correo.com',
      fechaNacimiento: '1984-11-13',
      direccion: 'Av. Maria Elena 370',
      password: 'Password123',
      confirmPassword: 'Password123'
    });

    vi.spyOn(mockAuthService, 'registrar').mockReturnValue({ 
      ok: false, 
      mensaje: 'El correo ya se encuentra registrado' 
    });

    component.registrar();

    expect(component.mensajeError).toBe('El correo ya se encuentra registrado');
    expect(component.mensajeExito).toBe(''); 
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
  
  // Prueba para correo

  it('Debe invalidar correo sin formato correcto', () =>{
    const correo = component.registroForm.get('correo');

    correo?.setValue('correo@correo');

    expect(correo?.errors?.['emailInvalido']).toBeTruthy();
  });

  it('Debe validar correo con formato correcto', () => {
    const correo = component.registroForm.get('correo');

    correo?.setValue('correo@correo.cl');

    expect(correo?.errors?.['emailInvalido']).toBeFalsy();
  });

  // Pruebas individuales para contraseña

  it('Debe invalidar el formulario si las contraseñas no coinciden', () => {
    const pass = component.registroForm.get('password');
    const confirmPass = component.registroForm.get('confirmPassword');

    pass?.setValue('Abcd.1234');
    confirmPass?.setValue('TotalmenteDistinta.99');

    component.registroForm.updateValueAndValidity();

    expect(confirmPass?.errors?.['noCoinciden']).toBeTruthy();
    expect(component.registroForm.valid).toBeFalsy();
  });

  it('Debe invalidar una contraseña sin numero', () => {
    const password = component.registroForm.get('password');

    password?.setValue('Qweqwe');

    expect(password?.errors?.['pattern']).toBeTruthy();
  });

  it('Debe validar una contraseña con numero', () => {
    const password = component.registroForm.get('password');

    password?.setValue('Qwe123');

    expect(password?.errors?.['pattern']).toBeFalsy();
  });

  it('Debe invalidar una contraseña sin mayuscula', () => {
    const password = component.registroForm.get('password');

    password?.setValue('qwe123');

    expect(password?.errors?.['pattern']).toBeTruthy();
  });

  it('Debe validar una contraseña con mayuscula', () => {
    const password = component.registroForm.get('password');

    password?.setValue('Qwe123');

    expect(password?.errors?.['pattern']).toBeFalsy();
  });

  it('Debe validar una contraseña con 6 caracteres', () => {
    const password = component.registroForm.get('password');

    password?.setValue('Qwe123');

    expect(password?.errors?.['minlength']).toBeFalsy();
  });

  it('Debe validar una contraseña con 18 caracteres', () => {
    const password = component.registroForm.get('password');

    password?.setValue('asdfghjklqwertyuio');

    expect(password?.errors?.['maxlength']).toBeFalsy();
  });

  it('Debe invalidar una contraseña con menos de 6 caracteres', () => {
    const password = component.registroForm.get('password');

    password?.setValue('Qwe12');

    expect(password?.errors?.['minlength']).toBeTruthy();
  });

  it('Debe invalidar una contraseña con mas de 18 caracteres', () => {
    const password = component.registroForm.get('password');

    password?.setValue('asdfghjklqwertyuiop');

    expect(password?.errors?.['maxlength']).toBeTruthy();
  });

  // Pruebas para rut

  it('Debe invalidar un rut inválido según modulo 11', () => {
    const rut = component.registroForm.get('rut');

    rut?.setValue('15940700-5');

    expect(rut?.errors?.['rutInvalido']).toBeTruthy();
  })

  it('Debe validar un rut válido según modulo 11', () => {
    const rut = component.registroForm.get('rut');

    rut?.setValue('15940700-4');

    expect(rut?.errors?.['rutInvalido']).toBeFalsy();
  })

  // Pruebas para nombre

  it('Debe invalidar un nombre que tenga solo espacio en blanco', () => {
    const nombre = component.registroForm.get('nombre');

    nombre?.setValue(' ');

    expect(nombre?.errors?.['isEmpty']).toBeTruthy();
  });

  it('Debe validar un nombre si no esta conformado solo por espacio en blanco', () => {
    const nombre = component.registroForm.get('nombre');
    
    nombre?.setValue('AAA');

    expect(nombre?.errors?.['isEmpty']).toBeFalsy();
  });

  // Prueba para apellido
  it('Debe invalidar el apellido que tenga solo espacio en blanco', () => {
    const apellido = component.registroForm.get('apellido');

    apellido?.setValue(' ');

    expect(apellido?.errors?.['isEmpty']).toBeTruthy();
  });

  it('Debe validar el apellido no esta conformado solo por espacio en blanco', () => {
    const apellido = component.registroForm.get('apellido');
    
    apellido?.setValue('AAA');

    expect(apellido?.errors?.['isEmpty']).toBeFalsy();
  });


  // Prueba para limpiar formulario
  it('Debe limpiar el formulario', () => {
    component.registroForm.controls['nombre'].setValue('Angelo');
    component.registroForm.controls['apellido'].setValue('Benvenuto');
    component.registroForm.controls['rut'].setValue('15940700-4');
    component.registroForm.controls['fechaNacimiento'].setValue('1984-11-13');
    component.registroForm.controls['direccion'].setValue('Av. Maria Elena 370');
    component.registroForm.controls['password'].setValue('Qwe123');
    component.registroForm.controls['confirmPassword'].setValue('Qwe123');

    component.limpiarFormulario();

    expect(component.registroForm.controls['nombre'].setValue(''));
    expect(component.registroForm.controls['apellido'].setValue(''));
    expect(component.registroForm.controls['rut'].setValue(''));
    expect(component.registroForm.controls['fechaNacimiento'].setValue(''));
    expect(component.registroForm.controls['direccion'].setValue(''));
    expect(component.registroForm.controls['password'].setValue(''));
    expect(component.registroForm.controls['confirmPassword'].setValue(''));
  });

});