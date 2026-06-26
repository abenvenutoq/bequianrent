import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ReservarAuto } from './reservar-auto';
import { AuthService } from '../../services/auth.services';
import { VehiculoService } from '../../services/vehiculos.services';
import { ReservaService } from '../../services/reservas.services';
import { ValidacionService } from '../../services/validacion.services';

/**
 * @description
 * Suite de Pruebas Unitarias para el componente {@link ReservarAuto}.
 * Verifica los cálculos matemáticos de duración y precio de reservas, así como
 * el flujo de persistencia al confirmar un arriendo.
 */
describe('Pruebas Unitarias - Componente ReservarAuto', () => {
  let component: ReservarAuto;
  let fixture: ComponentFixture<ReservarAuto>;

  // --- Datos Mock ---
  const mockUsuario = { rut: '1-9', correo: 'test@correo.com' };
  const mockVehiculo = { id: 10, precio: 30000, disponible: true }; // Precio 30.000 por día

  // --- Mocks de Servicios ---
  const mockAuthService = {
    isBrowser: vi.fn().mockReturnValue(true),
    obtenerSesion: vi.fn().mockReturnValue({ correo: 'test@correo.com' }),
    obtenerUsusario: vi.fn().mockReturnValue([mockUsuario]),
    estaLogueado: vi.fn().mockReturnValue(true)
  };

  const mockVehiculoService = {
    getVehiculosPorId: vi.fn().mockReturnValue(mockVehiculo),
    actualizarDisponibilidad: vi.fn()
  };

  const mockReservaService = {
    crearReserva: vi.fn()
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: vi.fn().mockReturnValue('10') // Simulamos entrar al auto ID 10
      }
    }
  };

  const mockValidacionService = {
    validarFechasReserva: vi.fn().mockReturnValue(null)
  };

  beforeEach(async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {}); // Silencia las alertas nativas

    await TestBed.configureTestingModule({
      imports: [ReservarAuto, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: VehiculoService, useValue: mockVehiculoService },
        { provide: ReservaService, useValue: mockReservaService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ValidacionService, useValue: mockValidacionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservarAuto);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Dispara el ngOnInit
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** @test 1. Función calcularTotal */
  it('Debe calcular correctamente los días y el total a pagar si las fechas son válidas', () => {
    // 1. Configuramos el formulario con un rango de 3 días de diferencia
    component.reservaForm.patchValue({
      fechaDesde: '2026-10-01',
      fechaHasta: '2026-10-04'
    });

    // 2. Ejecutamos la función de cálculo
    component.calcularTotal();

    // 3. Verificamos: 3 días x $30.000 = $90.000
    expect(component.diasReserva).toBe(3);
    expect(component.totalPagar).toBe(90000);
  });

  /** @test 2. Función confirmarReserva */
  it('Debe crear la reserva, bloquear el auto y redirigir si el formulario es válido', () => {
    const spyCrearReserva = vi.spyOn(mockReservaService, 'crearReserva');
    const spyActualizarDisp = vi.spyOn(mockVehiculoService, 'actualizarDisponibilidad');
    
    // 1. Simulamos un formulario válido
    component.reservaForm.patchValue({
      fechaDesde: '2026-10-01',
      fechaHasta: '2026-10-04'
    });
    component.calcularTotal(); // Generamos el precio y días

    // 2. Ejecutamos la confirmación
    component.confirmarReserva();

    // 3. Verificamos la secuencia de acciones esperadas
    expect(spyCrearReserva).toHaveBeenCalledWith({
      idVehiculo: 10,
      correo: 'test@correo.com',
      rut: '1-9',
      fechaDesde: '2026-10-01',
      fechaHasta: '2026-10-04',
      total: 90000,
      estado: 'Confirmada'
    });
    
    // Verifica que el auto se marcó como no disponible
    expect(spyActualizarDisp).toHaveBeenCalledWith(10, false); 
    
    // Verifica que redirecciona al perfil
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/mis-reservas']);
  });
});