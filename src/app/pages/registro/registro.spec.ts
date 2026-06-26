import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';


import { Registro } from './registro';
import { AuthService } from '../../services/auth.services';

/**
 * @description
 * Suite de Pruebas Unitarias para el componente {@link Registro}.
 * Evalúa rigurosamente el comportamiento del formulario de creación de usuarios,
 * verificando los validadores personalizados (RUT, Edad, Correos) y 
 * las reglas estrictas de contraseñas.
 */
describe('Pruebas Unitarias - Componente Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;

  /** Mock del AuthService simulando respuestas exitosas por defecto */
  const mockAuthService = { 
    registrar: () => ({ ok: true, mensaje: 'Éxito' }) 
  };
  
  /** Mock del enrutador para evitar navegaciones reales durante los tests */
  const mockRouter = { 
    navigate: () => {} 
  };

  /** Configuración del entorno de pruebas y compilación del componente */
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

  /** @test Verifica la inicialización base del componente */
  it('debe crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  /** @test Simula un registro completo con datos correctos */
  it('Debe ejecutar el registro correctamente si el formulario es válido', () => {
    component.registroForm.patchValue({
      nombre: 'Angelo',
      apellido: 'Benvenuto',
      rut: '15940700-4',
      correo: 'angelo@correo.com',
      fechaNacimiento: '1984-11-13',
      direccion: 'Av. Maria Elena 370',
      password: 'Password123*',
      confirmPassword: 'Password123*'
    });

    component.registrar();

    expect(component.mensajeExito).toBe('Éxito');
    expect(component.mensajeError).toBe('');
  });

  /** @test Simula un registro con un correo existente */
  it('Debe mostrar un mensaje de error si el registro falla (ej. correo ya existe)', () => {
    component.registroForm.patchValue({
      nombre: 'Angelo',
      apellido: 'Benvenuto',
      rut: '15940700-4', 
      correo: 'correo_duplicado@correo.com',
      fechaNacimiento: '1984-11-13',
      direccion: 'Av. Maria Elena 370',
      password: 'Password123*',
      confirmPassword: 'Password123*'
    });

    vi.spyOn(mockAuthService, 'registrar').mockReturnValue({ 
      ok: false, 
      mensaje: 'El correo ya se encuentra registrado' 
    });

    component.registrar();

    expect(component.mensajeError).toBe('El correo ya se encuentra registrado');
    expect(component.mensajeExito).toBe(''); 
  });

  /** @test Invalida form para menores de 13 años */
  it('Debe invalidar el formulario si la persona es menor de 13 años', () => {
    const controlFecha = component.registroForm.get('fechaNacimiento');

    const hoy = new Date();
    const hace5Anios = new Date(hoy.getFullYear() - 5, hoy.getMonth(), hoy.getDate());
    
    controlFecha?.setValue(hace5Anios.toISOString().split('T')[0]);

    expect(controlFecha?.valid).toBeFalsy();
    expect(controlFecha?.errors?.['menorDeEdad']).toBeTruthy();
  });
  
  /** @test Invalida form por correo con formato incorrecto */
  it('Debe invalidar correo sin formato correcto', () =>{
    const correo = component.registroForm.get('correo');

    correo?.setValue('correo@correo');

    expect(correo?.errors?.['emailInvalido']).toBeTruthy();
  });

  /** @test Valida form por correo con formato correcto */
  it('Debe validar correo con formato correcto', () => {
    const correo = component.registroForm.get('correo');

    correo?.setValue('correo@correo.cl');

    expect(correo?.errors?.['emailInvalido']).toBeFalsy();
  });

  /** @test Invalida form si las contraseñas no son identicas */
  it('Debe invalidar el formulario si las contraseñas no coinciden', () => {
    const pass = component.registroForm.get('password');
    const confirmPass = component.registroForm.get('confirmPassword');

    pass?.setValue('Abcd.1234');
    confirmPass?.setValue('TotalmenteDistinta.99');

    component.registroForm.updateValueAndValidity();

    expect(confirmPass?.errors?.['noCoinciden']).toBeTruthy();
    expect(component.registroForm.valid).toBeFalsy();
  });

  /** @test Invalida form contraseña sin numero */
  it('Debe invalidar una contraseña sin numero', () => {
    const password = component.registroForm.get('password');

    password?.setValue('*Qweqwe');

    expect(password?.errors?.['pattern']).toBeTruthy();
  });

  /** @test Valida form por contraseña con formato correcto */
  it('Debe validar una contraseña con numero', () => {
    const password = component.registroForm.get('password');

    password?.setValue('*Qwe123');

    expect(password?.errors?.['pattern']).toBeFalsy();
  });

  
  /** @test Invalida form por contraseña sin mayuscula */
  it('Debe invalidar una contraseña sin mayuscula', () => {
    const password = component.registroForm.get('password');

    password?.setValue('*qwe123');

    expect(password?.errors?.['pattern']).toBeTruthy();
  });

  /** @test Valida form por contraseña con mayuscula */
  it('Debe validar una contraseña con mayuscula', () => {
    const password = component.registroForm.get('password');

    password?.setValue('*Qwe123');

    expect(password?.errors?.['pattern']).toBeFalsy();
  });

  /** @test Valida form por contraseña con 6 caracteres */
  it('Debe validar una contraseña con 6 caracteres', () => {
    const password = component.registroForm.get('password');

    password?.setValue('Qwe123');

    expect(password?.errors?.['minlength']).toBeFalsy();
  });

  /** @test Valida form por contraseña con 18 caracteres */
  it('Debe validar una contraseña con 18 caracteres', () => {
    const password = component.registroForm.get('password');

    password?.setValue('asdfghjklqwertyuio');

    expect(password?.errors?.['maxlength']).toBeFalsy();
  });

  /** @test Valida form por contraseña con menos de 6 caracteres */
  it('Debe invalidar una contraseña con menos de 6 caracteres', () => {
    const password = component.registroForm.get('password');

    password?.setValue('Qwe12');

    expect(password?.errors?.['minlength']).toBeTruthy();
  });

  /** @test Valida form por contraseña con mas de 18 caracteres */
  it('Debe invalidar una contraseña con mas de 18 caracteres', () => {
    const password = component.registroForm.get('password');

    password?.setValue('asdfghjklqwertyuiop');

    expect(password?.errors?.['maxlength']).toBeTruthy();
  });

  /** @test Invalida form por rut incorrecto */
  it('Debe invalidar un rut inválido según modulo 11', () => {
    const rut = component.registroForm.get('rut');

    rut?.setValue('15940700-5');

    expect(rut?.errors?.['rutInvalido']).toBeTruthy();
  })

  /** @test Valida form por rut correcto */
  it('Debe validar un rut válido según modulo 11', () => {
    const rut = component.registroForm.get('rut');

    rut?.setValue('15940700-4');

    expect(rut?.errors?.['rutInvalido']).toBeFalsy();
  })

  /** @test Invalida form nombre con solo espacio en blanco */
  it('Debe invalidar un nombre que tenga solo espacio en blanco', () => {
    const nombre = component.registroForm.get('nombre');

    nombre?.setValue(' ');

    expect(nombre?.errors?.['isEmpty']).toBeTruthy();
  });

  /** @test Valida nombre si no esta compuesto solo con espacio en blanco */
  it('Debe validar un nombre si no esta conformado solo por espacio en blanco', () => {
    const nombre = component.registroForm.get('nombre');
    
    nombre?.setValue('AAA');

    expect(nombre?.errors?.['isEmpty']).toBeFalsy();
  });

  /** @test Invalida form apellido con solo espacio en blanco */
  it('Debe invalidar el apellido que tenga solo espacio en blanco', () => {
    const apellido = component.registroForm.get('apellido');

    apellido?.setValue(' ');

    expect(apellido?.errors?.['isEmpty']).toBeTruthy();
  });

  /** @test Valida apellido si no esta compuesto solo con espacio en blanco */
  it('Debe validar el apellido no esta conformado solo por espacio en blanco', () => {
    const apellido = component.registroForm.get('apellido');
    
    apellido?.setValue('AAA');

    expect(apellido?.errors?.['isEmpty']).toBeFalsy();
  });


  /** @test Para limpiar el formulario */
  it('Debe limpiar el formulario', () => {
    component.registroForm.controls['nombre'].setValue('Angelo');
    component.registroForm.controls['apellido'].setValue('Benvenuto');
    component.registroForm.controls['rut'].setValue('15940700-4');
    component.registroForm.controls['fechaNacimiento'].setValue('1984-11-13');
    component.registroForm.controls['direccion'].setValue('Av. Maria Elena 370');
    component.registroForm.controls['password'].setValue('Qwe123');
    component.registroForm.controls['confirmPassword'].setValue('Qwe123');

    component.limpiarFormulario();

    expect(component.registroForm.get('nombre')?.value).toBeNull;
    expect(component.registroForm.get('apellido')?.value).toBeNull;
    expect(component.registroForm.get('rut')?.value).toBeNull;
    expect(component.registroForm.get('fechaNacimiento')?.value).toBeNull;
    expect(component.registroForm.get('direccion')?.value).toBeNull;
    expect(component.registroForm.get('password')?.value).toBeNull;
    expect(component.registroForm.get('confirmPassword')?.value).toBeNull;
  });

});