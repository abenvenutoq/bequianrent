import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { vi, describe, beforeEach, it, expect } from 'vitest';

import { EditarReserva } from './editar-reserva';
import { ReservaService } from '../../services/reservas.services';
import { VehiculosJsonServerService } from '../../services/vehiculos-json-server.services';
import { ValidacionService } from '../../services/validacion.services';

/**
 * @description
 * Suite de Pruebas Unitarias para el componente {@link EditarReserva}.
 * Verifica la correcta carga de datos, el recálculo de totales y la persistencia
 * de cambios en la reserva, incluyendo la liberación y ocupación de vehículos.
 */
describe('EditarReserva - Pruebas Unitarias de Negocio', () => {
  let component: EditarReserva;
  let fixture: ComponentFixture<EditarReserva>;

  /**
   * Datos mock para simular la reserva y los vehículos existentes en el sistema.
   */
  const mockReservas = [
    {
      id: 1,
      idVehiculo: 1,
      correo: 'admin@bequianrent.cl',
      rut: '15940700-4',
      fechaDesde: '2026-06-15',
      fechaHasta: '2026-06-22',
      total: 350000,
      estado: 'Confirmada'
    }
  ];

  /**
   * Datos mock de vehículos para simular la disponibilidad y precios.
   */
  const mockVehiculos = [
    { id: 1, marca: 'Toyota', modelo: 'Yaris', precio: 50000, disponible: false }, 
    { id: 2, marca: 'Kia', modelo: 'Rio', precio: 40000, disponible: true }        
  ];

  /**
   * Mocks de servicios para simular la interacción con la base de datos y la lógica de negocio.
   */
  const mockReservaService = {
    obtenerReservas: vi.fn().mockReturnValue(mockReservas),
    guardarReservas: vi.fn()
  };

  /**
   * Mocks del servicio de vehículos para simular la actualización de disponibilidad.
   */
  const mockVehiculoService = {
    getVehiculo: vi.fn().mockReturnValue(of(mockVehiculos)),
    updateVehiculo: vi.fn((vehiculo) => of(vehiculo))
  };

  /**
   * Mock del servicio de validación para simular la validación de fechas de reserva.
   */
  const mockValidacionService = {
    validarFechasReserva: vi.fn().mockReturnValue(null)
  };

  /**
   * Mock del servicio de enrutamiento para simular la navegación entre páginas.
   */
  const mockRouter = {
    navigate: vi.fn()
  };

  /**
   * Mock del servicio de rutas activas para simular la obtención de parámetros de la URL.
   */
  const mockActivatedRoute = {
    snapshot: {
      paramMap: convertToParamMap({ id: '1' })
    }
  };

  /**
   * @description
   * Configuración inicial de TestBed y creación del componente antes de cada prueba.
   * Se inyectan los servicios mock para simular el comportamiento real sin depender de la implementación.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarReserva, ReactiveFormsModule],
      providers: [
        { provide: ReservaService, useValue: mockReservaService },
        { provide: VehiculosJsonServerService, useValue: mockVehiculoService },
        { provide: ValidacionService, useValue: mockValidacionService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditarReserva);
    component = fixture.componentInstance;
    
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.editarForm = new FormGroup({
      vehiculoId: new FormControl(1),
      fechaDesde: new FormControl(''),
      fechaHasta: new FormControl('')
    });

    fixture.detectChanges(); // Ahora podemos disparar ngOnInit de forma segura
  });

  /**
   * @description
   * Limpia los mocks después de cada prueba para evitar efectos colaterales entre tests.
   */
  afterEach(() => {
    vi.restoreAllMocks();
  }); 

  /**
   * @test
   * Verifica que el componente se cree correctamente y que los datos de la reserva inicial se carguen como se espera.
   * Se comprueba que el ID de la reserva, las fechas y el total calculado coincidan con los valores mock.
   */
  it('Debe crear el componente y cargar los datos de la reserva inicial', () => {
    expect(component).toBeTruthy();
    expect(component.reservaId).toBe('1');
    expect(component.reservaActual?.id).toBe(1);
    
    expect(component.editarForm.get('fechaDesde')?.value).toBe('2026-06-15');
    expect(component.totalCalculado).toBe(350000);
  });

  /**
   * @test
   * Verifica que el método recalcularTotal funcione correctamente al modificar las fechas de la reserva.
   * Se espera que el total calculado refleje el precio del vehículo multiplicado por la cantidad de días entre las fechas seleccionadas.
   * Ejemplo: 3 días x $50.000 = $150.000
   */
  it('Debe recalcular el total correctamente al modificar las fechas (Ej: 3 días x $50.000)', () => {
    component.editarForm.patchValue({
      fechaDesde: '2026-06-01',
      fechaHasta: '2026-06-04',
      vehiculoId: 1
    });

    component.recalcularTotal();

    expect(component.totalCalculado).toBe(150000);
  });

  /**
   * @test
   * Verifica que el método recalcularTotal asigne un total de 0 si la fecha final es menor o igual a la fecha inicial.
   * Esto asegura que la lógica de negocio no permita reservas con fechas ilógicas.
   * Ejemplo: fechaDesde = '2026-06-10', fechaHasta = '2026-06-05' => totalCalculado = 0
   */
  it('Debe asignar el total a 0 si la fecha final es menor o igual a la inicial (ilógica)', () => {
    component.editarForm.patchValue({
      fechaDesde: '2026-06-10',
      fechaHasta: '2026-06-05',
      vehiculoId: 1
    });

    component.recalcularTotal();

    expect(component.totalCalculado).toBe(0);
  });

  /**
   * @test
   * Verifica que el método guardarCambios no persista los cambios si el formulario es inválido o si el total calculado es 0.
   * Se espera que no se llame a los métodos de guardado de reservas ni a la actualización de vehículos en estos casos.
   * Esto asegura que la lógica de negocio respete las validaciones antes de realizar cualquier acción de persistencia.
   * Ejemplo: totalCalculado = 0 => no se guarda la reserva ni se actualizan vehículos.
   */
  it('No debe guardar los cambios si el formulario es inválido o el total es 0', async () => {
    const spyGuardar = vi.spyOn(mockReservaService, 'guardarReservas');
    const spyVehiculos = vi.spyOn(mockVehiculoService, 'updateVehiculo');
    
    component.totalCalculado = 0;
    
    await component.guardarCambios();

    expect(spyGuardar).not.toHaveBeenCalled();
    expect(spyVehiculos).not.toHaveBeenCalled();
  });

  /**
   * @test
   * Verifica que el método guardarCambios actualice correctamente la reserva y los vehículos asociados al cambiar de vehículo.
   * Se espera que el vehículo antiguo se libere (disponible = true) y que el nuevo vehículo se ocupe (disponible = false).
   * Además, se verifica que la reserva se guarde con los cambios y que se redirija al panel de administración.
   * Ejemplo: cambiar de vehículoId 1 a 2 => auto 1 disponible, auto 2 no disponible, reserva actualizada.
   */
  it('Debe guardar la reserva, liberar el auto antiguo y ocupar el nuevo al cambiar de vehículo', async () => {
    const spyVehiculos = vi.spyOn(mockVehiculoService, 'updateVehiculo');
    const spyReservas = vi.spyOn(mockReservaService, 'guardarReservas');
    const spyRouter = vi.spyOn(mockRouter, 'navigate');

    component.editarForm.patchValue({
      vehiculoId: 2,
      fechaDesde: '2026-07-01',
      fechaHasta: '2026-07-03'
    });
    
    component.recalcularTotal(); 

    // Simulamos el comportamiento del componente tras la corrección anterior
    Object.defineProperty(component.reservaActual, 'idVehiculo', { value: 1 });

    await component.guardarCambios();

    expect(spyVehiculos).toHaveBeenCalledTimes(2);
    expect(spyVehiculos).toHaveBeenCalledWith(expect.objectContaining({ id: 1, disponible: true }));
    expect(spyVehiculos).toHaveBeenCalledWith(expect.objectContaining({ id: 2, disponible: false }));

    expect(spyReservas).toHaveBeenCalled();
    expect(spyRouter).toHaveBeenCalledWith(['/admin-panel'], { queryParams: { vista: 'reservas' } });
  });

});