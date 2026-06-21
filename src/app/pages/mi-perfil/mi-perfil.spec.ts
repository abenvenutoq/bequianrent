import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MiPerfil } from './mi-perfil';
import { AuthService } from '../../services/auth.services';

describe('Pruebas Unitarias - Componente Mi Perfil', () => {
  let component: MiPerfil;
  let fixture: ComponentFixture<MiPerfil>;

  // Creamos un usuario falso para que el componente trabaje con él
  const mockUsuario = {
    id: 1,
    rut: '15940700-4',
    correo: 'angelo@correo.com',
    nombre: 'Angelo',
    apellido: 'Benvenuto',
    fechaNacimiento: '1984-11-13',
    direccion: 'Av. Maria Elena 370',
    password: 'Password123'
  };

  // Mock del AuthService
  const mockAuthService = {
    isBrowser: () => true,
    obtenerSesion: () => ({ loged: true, correo: 'angelo@correo.com' }) as any,
    obtenerUsusario: () => [mockUsuario],
    guardarUsuario: () => {},
    cerrarSesion: () => {}
  };

  // Mock del Router
  const mockRouter = {
    navigate: vi.fn(),
    navigateByUrl: () => Promise.resolve(true) 
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiPerfil, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MiPerfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });


  it('Debe crear el componente y cargar el usuario en el ngOnInit', () => {
    expect(component).toBeTruthy();
    expect(component.usuario?.correo).toBe('angelo@correo.com'); 
  });

  // Pruebas de Redirección
  it('Debe redirigir al login si NO hay una sesión activa', () => {
    vi.spyOn(mockAuthService, 'obtenerSesion').mockReturnValue(null);
    const routerSpy = vi.spyOn(mockRouter, 'navigate');

    component.ngOnInit();

    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });

  // Pruebas de Interfaz (Editar datos)
  it('Debe activar el modo edición y rellenar el formulario con los datos del usuario', () => {
    component.activarEdicion();

    expect(component.editando).toBeTruthy();
    expect(component.perfilForm.get('nombre')?.value).toBe('Angelo');
    expect(component.perfilForm.get('direccion')?.value).toBe('Av. Maria Elena 370');
  });

  // Prueba para cancelar edición (Botón Cancelar)
  it('Debe cancelar el modo edición', () => {
    component.activarEdicion();
    component.cancelarEdicion();
    
    expect(component.editando).toBeFalsy();
  });

  // Prueba para invalidar form si se borra el nombre
  it('Debe invalidar el formulario si se borra el nombre (es requerido)', () => {
    component.activarEdicion();
    const controlNombre = component.perfilForm.get('nombre');
    
    controlNombre?.setValue('');
    
    expect(controlNombre?.hasError('required')).toBeTruthy();
    expect(component.perfilForm.invalid).toBeTruthy();
  });

  // Prueba debe guardar si formulario es válido 
  it('Debe guardar los cambios y actualizar el usuario si el formulario es válido', () => {
    component.activarEdicion();
    
    component.perfilForm.patchValue({
      nombre: 'Angelo Editado',
      rut: '15940700-4',
      apellido: 'Benvenuto',
      fechaNacimiento: '1984-11-13',
      direccion: 'Nueva Dirección 123',
      password: 'Password123',
      confirmPassword: 'Password123'
    });

    const guardarSpy = vi.spyOn(mockAuthService, 'guardarUsuario');

    vi.useFakeTimers();

    component.guardarCambios();

    expect(guardarSpy).toHaveBeenCalled(); 
    expect(component.mensajeExito).toBe('¡Datos y contraseña actualizados con éxito!'); 
    expect(component.usuario?.nombre).toBe('Angelo Editado');

    vi.advanceTimersByTime(1500);
    expect(component.editando).toBeFalsy(); 

    vi.useRealTimers();
  });

  it('NO debe guardar los cambios si el formulario es inválido', () => {
    component.activarEdicion();
    
    component.perfilForm.patchValue({ apellido: '' });

    const guardarSpy = vi.spyOn(mockAuthService, 'guardarUsuario');

    component.guardarCambios();

    expect(guardarSpy).not.toHaveBeenCalled();
    expect(component.editando).toBeTruthy();
  });

});