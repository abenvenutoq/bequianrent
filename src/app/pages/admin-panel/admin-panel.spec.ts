import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Reserva } from '../../models/modelos';
import { AdminPanel } from './admin-panel';
import { AuthService } from '../../services/auth.services';
import { ReservaService } from '../../services/reservas.services';
import { VehiculoService } from '../../services/vehiculos.services';

/**
 * @description
 * Suite de Pruebas Unitarias para el componente contenedor {@link AdminPanel}.
 * Verifica la correcta asignación de pestañas según la URL (QueryParams), 
 * la carga de datos iniciales y el manejo centralizado de eventos (cambio de estados de reserva).
 */
describe('Pruebas Unitarias - Componente Admin Panel', () => {
  let component: AdminPanel;
  let fixture: ComponentFixture<AdminPanel>;

  // --- Datos Mock Simuldos ---
  // Agregamos fechaNacimiento válida para que los componentes hijos no rompan el DatePipe al renderizarse
  const mockUsuarios = [
    { id: 1, nombre: 'Admin', rol: 'admin', fechaNacimiento: '1990-01-01' },
    { id: 2, nombre: 'Cliente', rol: 'cliente', fechaNacimiento: '1995-05-05' }
  ];

  const mockReservas: Reserva[] = [{
    id: 1,
    idVehiculo: 10,
    estado: 'Pendiente'
  } as Reserva];

  const mockVehiculos = [
    { id: 10, marca: 'Toyota', modelo: 'Yaris', disponible: false }
  ];

  // --- Mocks de Servicios ---
  const mockAuthService = {
    isBrowser: vi.fn(() => true),
    obtenerUsuario: vi.fn(() => mockUsuarios),
    esAdmin: vi.fn(() => true)
  };

  const mockReservaService = {
    obtenerReservas: vi.fn(() => mockReservas),
    guardarReservas: vi.fn() // Espía para ver si el Padre guarda correctamente
  };

  const mockVehiculoService = {
    getVehiculos: vi.fn(() => mockVehiculos),
    saveVehiculos: vi.fn() // Espía para ver si el Padre guarda la disponibilidad del auto
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  const mockActivatedRoute = {
    // Simulamos que el usuario llegó por la URL: /admin-panel?vista=vehiculos
    queryParams: of({ vista: 'vehiculos' }) 
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPanel], // Al ser standalone importa automáticamente a sus componentes hijos
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
    fixture.detectChanges(); // Ejecuta el ngOnInit() y renderiza el HTML
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /** @test Inicialización básica y parámetros de URL */
  it('Debe crear el componente y cargar datos', () => {
    expect(component).toBeTruthy();
    
    // Verifica que el Padre extrajo la info de los servicios
    expect(component.usuarios.length).toBe(2);
    expect(component.vehiculos.length).toBe(1);
    expect(component.reservas.length).toBe(1);
    
  });

  /** @test Lógica de cambio de vista manual */
  it('Debe cambiar la vista actual usando el método cambiarVista()', () => {
    component.cambiarVista('reservas');
    expect(component.vistaActual).toBe('reservas');
  });

  /** @test Integración Padre-Hijo: Liberación de vehículos */
  it('Debe actualizar estado a Completada, liberar el vehículo y guardar cambios', () => {
    const reservaSimulada = mockReservas[0];
    
    // Act: Simulamos que el componente hijo emitió el evento de cambio
    component.actualizarEstadoReserva({
      reserva: reservaSimulada, 
      nuevoEstado: 'Completada'
    });

    // Assert 1: La reserva en memoria local debió cambiar
    expect(reservaSimulada.estado).toBe('Completada');

    // Assert 2: El vehículo asociado (ID 10) debió quedar Disponible (true)
    const vehiculoModificado = component.vehiculos.find(v => v.id === 10);
    expect(vehiculoModificado?.disponible).toBe(true);

    // Assert 3: Se debieron llamar a los servicios de guardado para la persistencia
    expect(mockVehiculoService.saveVehiculos).toHaveBeenCalledWith(component.vehiculos);
    expect(mockReservaService.guardarReservas).toHaveBeenCalledWith(component.reservas);
  });
});