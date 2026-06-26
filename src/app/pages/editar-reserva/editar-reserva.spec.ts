import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EditarReserva } from './editar-reserva';
import { ReservaService } from '../../services/reservas.services';
import { VehiculoService } from '../../services/vehiculos.services';
import { ValidacionService } from '../../services/validacion.services';

/**
 * @description
 * Pruebas Unitarias para el componente {@link EditarReserva}.
 * Evalúa el correcto funcionamiento del formulario de edición, enfocándose en la
 * lógica matemática del recálculo de precios por día y la correcta actualización
 * de los estados (disponibilidad) de la flota de vehículos al realizar cambios.
 */
describe('Pruebas Unitarias - Componente Editar Reserva', () => {
  let component: EditarReserva;
  let fixture: ComponentFixture<EditarReserva>;

  // --- Datos de prueba (Mocks de BD) ---
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

  const mockVehiculos = [
    { id: 1, marca: 'Toyota', modelo: 'Yaris', precio: 50000, disponible: false }, // Auto actual
    { id: 2, marca: 'Kia', modelo: 'Rio', precio: 40000, disponible: true }        // Auto nuevo
  ];

  // --- Mocks de Servicios ---
  const mockReservaService = {
    obtenerReservas: vi.fn().mockReturnValue(mockReservas),
    guardarReservas: vi.fn()
  };

  const mockVehiculoService = {
    getVehiculos: vi.fn().mockReturnValue(mockVehiculos),
    saveVehiculos: vi.fn()
  };

  const mockValidacionService = {
    validarFechasReserva: vi.fn().mockReturnValue(null)
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: vi.fn().mockReturnValue('1')
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarReserva, ReactiveFormsModule],
      providers: [
        { provide: ReservaService, useValue: mockReservaService },
        { provide: VehiculoService, useValue: mockVehiculoService },
        { provide: ValidacionService, useValue: mockValidacionService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditarReserva);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /** @test Verifica la inicialización base del componente */
  it('Debe crear el componente y cargar los datos de la reserva inicial', () => {
    expect(component).toBeTruthy();
    expect(component.reservaId).toBe('1');
    expect(component.reservaActual?.id).toBe(1);
    
    expect(component.editarForm.get('vehiculoId')?.value).toBe(1);
    expect(component.editarForm.get('fechaDesde')?.value).toBe('2026-06-15');
    expect(component.totalCalculado).toBe(350000);
  });

  /** @test Verifica que el recálculo se ejecute correctamente al cambiar las fechas 
   * @user
  */
  it('Debe recalcular el total correctamente al modificar las fechas (Ej: 3 días x $50.000)', () => {
    component.editarForm.patchValue({
      fechaDesde: '2026-06-01',
      fechaHasta: '2026-06-04',
      vehiculoId: 1
    });

    component.recalcularTotal();

    // 3 días * 50000 = 150000
    expect(component.totalCalculado).toBe(150000);
  });

  /** @test Validaciones de fechas ilógicas */
  it('Debe asignar el total a 0 si la fecha final es menor o igual a la inicial', () => {
    component.editarForm.patchValue({
      fechaDesde: '2026-06-10',
      fechaHasta: '2026-06-05', // Fecha inválida (viaje al pasado)
    });

    component.recalcularTotal();

    expect(component.totalCalculado).toBe(0);
  });

  // --- Pruebas del Flujo de Guardado y Cambio de Estados ---

  /** @test Prevención de errores de guardado */
  it('No debe guardar los cambios si el formulario es inválido o el total es 0', () => {
    const spyGuardar = vi.spyOn(mockReservaService, 'guardarReservas');
    
    // Forzamos un total en 0
    component.totalCalculado = 0;
    
    component.guardarCambios();

    expect(spyGuardar).not.toHaveBeenCalled();
  });

  /** @test Flujo Feliz y actualización de disponibilidad de vehículos */
  it('Debe guardar la reserva, liberar el auto antiguo y ocupar el nuevo', () => {
    const spyVehiculos = vi.spyOn(mockVehiculoService, 'saveVehiculos');
    const spyReservas = vi.spyOn(mockReservaService, 'guardarReservas');
    const spyRouter = vi.spyOn(mockRouter, 'navigate');

    // Cambiamos al vehículo ID 2 (Kia)
    component.editarForm.patchValue({
      vehiculoId: 2,
      fechaDesde: '2026-07-01',
      fechaHasta: '2026-07-03'
    });
    
    // 2 días * 40.000 = 80.000
    component.recalcularTotal(); 

    // Ejecutamos el guardado
    component.guardarCambios();

    // 1. Verificamos que se actualizaron los estados en el servicio de vehículos
    expect(spyVehiculos).toHaveBeenCalled();
    const vehiculosActualizados = spyVehiculos.mock.calls[0][0];
    
    // El Toyota (ID 1) debe quedar libre, el Kia (ID 2) debe quedar ocupado
    expect(vehiculosActualizados.find((v: any) => v.id === 1)?.disponible).toBe(true);
    expect(vehiculosActualizados.find((v: any) => v.id === 2)?.disponible).toBe(false);

    // 2. Verificamos que se guardó la reserva
    expect(spyReservas).toHaveBeenCalled();

    // 3. Verificamos la redirección con los queryParams hacia admin-panel
    expect(spyRouter).toHaveBeenCalledWith(['/admin-panel'], { queryParams: { vista: 'reservas' } });
  });

});