import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';

import { AdminPanel } from './admin-panel';
import { AuthService } from '../../services/auth.services';
import { ReservaService } from '../../services/reservas.services';
import { VehiculoService } from '../../services/vehiculos.services';

/**
 * @description
 * Suite de Pruebas Unitarias para el componente {@link AdminPanel}.
 * Verifica la protección de la ruta, el despliegue de las distintas vistas del dashboard
 * y la lógica estricta del cambio de estados de vehículos según las operaciones de las reservas.
 */
describe('Pruebas Unitarias - Componente Admin Panel', () => {
  let component: AdminPanel;
  let fixture: ComponentFixture<AdminPanel>;

  // --- Datos Mock (Mocks de Bases de Datos) ---
  const mockUsuarios = [
    { id: 1, nombre: 'Admin', rol: 'admin' },
    { id: 2, nombre: 'Cliente', rol: 'cliente' }
  ];

  const mockReservas = [
    { id: 1, idVehiculo: 10, estado: 'Pendiente' }
  ];

  const mockVehiculos = [
    { id: 10, marca: 'Toyota', modelo: 'Yaris', disponible: false }
  ];

  // --- Mocks de Servicios ---
  const mockAuthService = {
    isBrowser: vi.fn().mockReturnValue(true),
    esAdmin: vi.fn().mockReturnValue(true),
    obtenerUsusario: vi.fn().mockReturnValue(mockUsuarios)
  };

  const mockReservaService = {
    obtenerReservas: vi.fn().mockReturnValue(mockReservas),
    guardarReservas: vi.fn()
  };

  const mockVehiculoService = {
    getVehiculos: vi.fn().mockReturnValue(mockVehiculos),
    saveVehiculos: vi.fn()
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  const mockActivatedRoute = {
    snapshot: {
      queryParamMap: {
        get: vi.fn().mockReturnValue('vehiculos') // Simulamos entrar con ?vista=vehiculos
      }
    }
  };

  beforeEach(async () => {
    // Interceptamos alerts y confirms nativos para que no bloqueen los tests
    vi.stubGlobal('alert', vi.fn());
    vi.stubGlobal('confirm', vi.fn(() => true));

    await TestBed.configureTestingModule({
      imports: [AdminPanel],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ReservaService, useValue: mockReservaService },
        { provide: VehiculoService, useValue: mockVehiculoService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPanel);
    component = fixture.componentInstance;
    fixture.detectChanges(); 
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** @test Inicialización básica y parámetros de URL */
  it('Debe crear el componente, cargar datos y ajustar la vista desde los queryParams', () => {
    expect(component).toBeTruthy();
    expect(component.usuarios.length).toBe(2);
    expect(component.vehiculos.length).toBe(1);
    expect(component.reservas.length).toBe(1);
    
    // Entró con ?vista=vehiculos según nuestro mockActivatedRoute
    expect(component.vistaActual).toBe('vehiculos'); 
  });

  /** @test Protección de Rutas (Guardia manual) */
  it('Debe expulsar al usuario si no posee rol de Administrador', () => {
    mockAuthService.esAdmin.mockReturnValueOnce(false); // Simulamos que es un cliente normal
    
    component.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  /** @test Verificación de utilidades de la vista */
  it('Debe cambiar de vista y retornar el contador correcto', () => {
    component.cambiarVista('usuarios');
    expect(component.vistaActual).toBe('usuarios');
    expect(component.getContadorActual()).toBe(2); // 2 usuarios mockeados

    component.cambiarVista('reservas');
    expect(component.getContadorActual()).toBe(1); // 1 reserva mockeada
  });

  /** @test Cambio de estados (Reglas de Negocio) */
  it('Debe liberar el vehículo (disponible: true) cuando la reserva se Cancelada o Completada', () => {
    const spySaveVehiculos = vi.spyOn(mockVehiculoService, 'saveVehiculos');
    const spySaveReservas = vi.spyOn(mockReservaService, 'guardarReservas');
    
    const reservaTest = component.reservas[0];
    
    // Modificamos a Completada
    component.cambiarEstadoReserva(reservaTest, 'Completada');

    // El auto ID 10 ahora debería estar disponible
    expect(component.vehiculos[0].disponible).toBe(true);
    
    // Verificamos guardado persistente
    expect(spySaveVehiculos).toHaveBeenCalled();
    expect(spySaveReservas).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Estado de la reserva #1 modificado a: Completada');
  });

  /** @test Lógica de borrado con confirmación */
  it('Debe eliminar un vehículo de la flota si se confirma la acción', () => {
    const spySaveVehiculos = vi.spyOn(mockVehiculoService, 'saveVehiculos');

    component.eliminarVehiculo(10); // ID del Toyota Yaris mockeado

    // El arreglo de vehículos debe quedar vacío
    expect(component.vehiculos.length).toBe(0);
    expect(spySaveVehiculos).toHaveBeenCalled();
  });

  /** @test Lógica visual de cruce de datos */
  it('Debe retornar correctamente la marca y el modelo del vehículo a través de su ID', () => {
    const nombre = component.obtenerNombreAuto(10);
    expect(nombre).toBe('Toyota Yaris');

    const nombreNoEncontrado = component.obtenerNombreAuto(999);
    expect(nombreNoEncontrado).toBe('Vehículo #999');
  });
});