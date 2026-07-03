import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MiPerfil } from './mi-perfil';
import { AuthService } from '../../services/auth.services';

/**
 * @description
 * Suite de Pruebas Unitarias exhaustivas para el componente {@link MiPerfil}.
 * Evalúa el ciclo completo del perfil de usuario: carga de datos de la sesión activa,
 * comportamiento de la transición al modo de edición, validación reactiva de los campos,
 * y persistencia segura de la actualización (simulando los temporizadores de UX mediante Vitest).
 */
describe('Pruebas Unitarias - Componente Mi Perfil', () => {
  let component: MiPerfil;
  let fixture: ComponentFixture<MiPerfil>;

  /** Mock simulando un registro extraído del LocalStorage. */
  const mockUsuario = {
    id: 1,
    rut: '15940700-4',
    correo: 'angelo@correo.com',
    nombre: 'Angelo',
    apellido: 'Benvenuto',
    fechaNacimiento: '1984-11-13',
    direccion: 'Av. Maria Elena 370',
    password: 'Password123*'
  };

  /** Mock del `AuthService` para interceptar validaciones de sesión y guardados. */
  const mockAuthService = {
    isBrowser: () => true,
    obtenerSesion: () => ({ loged: true, correo: 'angelo@correo.com' }) as any,
    obtenerUsuario: () => [mockUsuario],
    guardarUsuario: () => {},
    cerrarSesion: () => {}
  };

  /** Mock del servicio de enrutamiento para evitar redirecciones reales y atrapar sus llamados. */
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

  /** @test Verifica la inicialización del componente y la correcta inyección de la sesión mockeada. */
  it('Debe crear el componente y cargar el usuario en el ngOnInit', () => {
    expect(component).toBeTruthy();
    expect(component.usuario?.correo).toBe('angelo@correo.com'); 
  });

  /** @test Redirige a login si no existe sesión activa */
  it('Debe redirigir al login si NO hay una sesión activa', () => {
    vi.spyOn(mockAuthService, 'obtenerSesion').mockReturnValue(null);
    const routerSpy = vi.spyOn(mockRouter, 'navigate');

    component.ngOnInit();

    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });

  /** @test Comprueba la activación del formulario y que se inyecte la data mediante `patchValue`. */
  it('Debe activar el modo edición y rellenar el formulario con los datos del usuario', () => {
    component.activarEdicion();

    expect(component.editando).toBeTruthy();
    expect(component.perfilForm.get('nombre')?.value).toBe('Angelo');
    expect(component.perfilForm.get('direccion')?.value).toBe('Av. Maria Elena 370');
  });

  /** @test Prueba para cancelar edición (Botón Cancelar) */
  it('Debe cancelar el modo edición', () => {
    component.activarEdicion();
    component.cancelarEdicion();
    
    expect(component.editando).toBeFalsy();
  });

  /** @test para invalidad el form en caso que el nombre se borre */
  it('Debe invalidar el formulario si se borra el nombre (es requerido)', () => {
    component.activarEdicion();
    const controlNombre = component.perfilForm.get('nombre');
    
    controlNombre?.setValue('');
    
    expect(controlNombre?.hasError('required')).toBeTruthy();
    expect(component.perfilForm.invalid).toBeTruthy();
  });

  /** @test debe guardar los cambios si el form es válido */
  it('Debe guardar los cambios y actualizar el usuario si el formulario es válido', () => {
    component.activarEdicion();
    
    component.perfilForm.patchValue({
      nombre: 'Angelo Editado',
      rut: '15940700-4',
      apellido: 'Benvenuto',
      fechaNacimiento: '1984-11-13',
      direccion: 'Nueva Dirección 123',
      password: '*Password123',
      confirmPassword: '*Password123'
    });

    const guardarSpy = vi.spyOn(mockAuthService, 'guardarUsuario');

    // Congela el tiempo para testear el setTimeout de UX (1.5 segundos)
    vi.useFakeTimers();

    component.guardarCambios();

    expect(guardarSpy).toHaveBeenCalled(); 
    expect(component.mensajeExito).toBe('¡Datos y contraseña actualizados con éxito!'); 
    expect(component.usuario?.nombre).toBe('Angelo Editado');

    // Avanza el reloj virtual 1500 ms
    vi.advanceTimersByTime(1500);
    // Verifica que luego de ese tiempo el modo edición se haya cerrado automáticamente
    expect(component.editando).toBeFalsy(); 

    vi.useRealTimers();
  });

  /** @test no debe guardar los datos si el form es inválido */
  it('NO debe guardar los cambios si el formulario es inválido', () => {
    component.activarEdicion();
    
    component.perfilForm.patchValue({ apellido: '' });

    const guardarSpy = vi.spyOn(mockAuthService, 'guardarUsuario');

    component.guardarCambios();

    expect(guardarSpy).not.toHaveBeenCalled();
    expect(component.editando).toBeTruthy();
  });

});