import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.services';
import { Usuario } from '../models/modelos';

/**
 * @description
 * Suite para pruebas unitarias para el servicio {@link AuthService}
 */
describe('Pruebas Unitarias - AuthService', () => {
  let service: AuthService;

  const mockUsuarios: Usuario[] = [
    { id: 1, nombre: 'Angelo', apellido: 'Benvenuto', correo: 'admin@correo.com', password: '123', rut: '111-1', fechaNacimiento: '1990-01-01', direccion: '', rol: 'admin' }
  ];

  beforeEach(() => {
    // 1. MOCKEAMOS EL STORAGE GLOBALMENTE ANTES DE INYECTAR EL SERVICIO
    const mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    vi.stubGlobal('localStorage', mockStorage);
    vi.stubGlobal('sessionStorage', mockStorage);

    // 2. Ahora sí podemos configurar e inyectar el servicio de forma segura
    TestBed.configureTestingModule({ providers: [AuthService] });
    service = TestBed.inject(AuthService);
    
    // 3. Interceptamos los métodos internos
    vi.spyOn(service, 'isBrowser').mockReturnValue(true);
    vi.spyOn(service, 'obtenerUsusario').mockReturnValue(mockUsuarios);
    vi.spyOn(service, 'guardarUsuario').mockImplementation(() => {});
  });

  /** @test 1. Función Login */
  it('Debe iniciar sesión correctamente con credenciales válidas', () => {
    // Usamos 'login' que es el nombre del método en tu auth.services.ts
    const resultado = service.iniciarSesion('admin@correo.com', '123');
    
    expect(resultado.ok).toBeTruthy();
    expect(resultado.mensaje).toContain('Bienvenido');
  });

  /** @test 2. Función Registrar */
  it('No debe permitir registrar un usuario con un correo ya existente', () => {
    // Intentamos registrar con el correo 'admin@correo.com' que ya está en el mock
    const resultado = service.registrar('nombre', 'apellido', '222-2', 'admin@correo.com', '2000-01-01', 'direccion', '*Pass123');
    
    expect(resultado.ok).toBeFalsy();
    expect(resultado.mensaje).toContain('ya se encuentra registrado');
  });
});