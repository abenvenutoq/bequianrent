import { TestBed } from '@angular/core/testing';
import { ReservaService } from './reservas.services';
import { Reserva } from '../models/modelos';

/**
 * @description
 * Suite de Pruebas Unitarias para el servicio {@link ReservaService}.
 */
describe('Pruebas Unitarias - ReservaService', () => {
  let service: ReservaService;

  const mockReservas: Reserva[] = [
    { id: 1, idVehiculo: 10, correo: 'test@test.com', rut: '1-9', fechaDesde: '2026-01-01', fechaHasta: '2026-01-05', total: 1000, estado: 'Pendiente' }
  ];

  // 1. Creamos nuestro propio "LocalStorage" simulado
  const mockStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };

  beforeEach(() => {
    // 2. Le decimos a Vitest que instale este LocalStorage globalmente en el entorno
    vi.stubGlobal('localStorage', mockStorage);

    TestBed.configureTestingModule({ providers: [ReservaService] });
    service = TestBed.inject(ReservaService);
    
    // Forzamos a que el servicio crea que el storage está disponible
    vi.spyOn(service, 'storageDisponible').mockReturnValue(true);
    vi.spyOn(service, 'obtenerReservas').mockReturnValue(mockReservas);
  });

  /** @test 1. Función Crear Reserva */
  it('Debe crear una nueva reserva y asignarle un ID autoincremental correcto', () => {
    const guardarSpy = vi.spyOn(service, 'guardarReservas').mockImplementation(() => {});
    
    const nuevaReserva = { 
        idVehiculo: 11, correo: 'a@a.com', rut: '2-7', fechaDesde: '2026-02-01', fechaHasta: '2026-02-02', total: 500, estado: 'Pendiente' 
    };

    service.crearReserva(nuevaReserva);

    // Verificamos que se haya llamado a guardar
    expect(guardarSpy).toHaveBeenCalled();
    
    // Verificamos que se intentó guardar un arreglo con 2 elementos y que el nuevo ID asignado es 2
    const reservasGuardadas = guardarSpy.mock.calls[0][0];
    expect(reservasGuardadas.length).toBe(2);
    expect(reservasGuardadas[1].id).toBe(2); // El autoincremental hizo 1 + 1
  });

  /** @test 2. Función Inicializar Datos */
  it('Debe inyectar los datos semilla si el LocalStorage está vacío', () => {
    mockStorage.getItem.mockReturnValue(null);
    const guardarSpy = vi.spyOn(service, 'guardarReservas').mockImplementation(() => {});

    service.inicializarDatos();

    expect(guardarSpy).toHaveBeenCalledWith(service.reservasBase);
  });
});