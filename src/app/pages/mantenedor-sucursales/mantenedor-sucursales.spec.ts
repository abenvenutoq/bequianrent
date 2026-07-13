import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { vi, describe, beforeEach, it, expect } from 'vitest';

import { MantenedorSucursales } from './mantenedor-sucursales';
import { SucursalesService } from '../../services/sucursales.services';
import { Sucursales } from '../../models/modelos';

/**
 * @description
 * Suite de Pruebas Unitarias para el componente {@link MantenedorSucursales}.
 * Verifica la correcta carga de datos, validaciones de formulario, creación, edición,
 * eliminación y restauración de sucursales, incluyendo la interacción con el servicio
 * {@link SucursalesService} simulado.
 */
describe('MantenedorSucursales - Pruebas de Negocio', () => {
  let component: MantenedorSucursales;
  let fixture: ComponentFixture<MantenedorSucursales>;
  let sucursalesServiceMock: any;

  /** Datos mock de sucursales para simular la carga inicial y las operaciones CRUD. */
  const mockSucursales: Sucursales[] = [
    { id: 1, nombre: 'Sucursal Central', direccion: 'Avenida 1', ciudad: 'Santiago', telefono: '12345678', jefeSucursal: 'Juan Pérez', horario: '09:00 - 18:00' },
    { id: 2, nombre: 'Sucursal Norte', direccion: 'Avenida 2', ciudad: 'Antofagasta', telefono: '87654321', jefeSucursal: 'Ana Gómez', horario: '10:00 - 19:00' }
  ];

  /** Datos mock de una nueva sucursal válida para pruebas de creación.*/
  const nuevaSucursalValida = {
    nombre: 'Sucursal Sur',
    direccion: 'Avenida 3',
    ciudad: 'Concepción',
    telefono: '11223344',
    jefeSucursal: 'Carlos Ruiz',
    horario: '08:00 - 17:00'
  };

  /** Configuración inicial de TestBed y creación del componente antes de cada prueba. */
  beforeEach(async () => {
    sucursalesServiceMock = {
      obtenerSucursales: vi.fn().mockReturnValue(of(mockSucursales)),
      agregarSucursal: vi.fn().mockReturnValue(of([...mockSucursales, { id: 3, ...nuevaSucursalValida }])),
      editarSucursal: vi.fn().mockReturnValue(of(mockSucursales)),
      eliminarSucursal: vi.fn().mockReturnValue(of([mockSucursales[1]])), // Simula que borró la 1
      restaurarDatosDesdeAPI: vi.fn().mockReturnValue(of(mockSucursales))
    };

    await TestBed.configureTestingModule({
      imports: [MantenedorSucursales, ReactiveFormsModule],
      providers: [
        { provide: SucursalesService, useValue: sucursalesServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MantenedorSucursales);
    component = fixture.componentInstance;
    
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    fixture.detectChanges(); 
  });

  /** Limpia los mocks después de cada prueba para evitar efectos colaterales entre pruebas. */
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** @test Debe crear el componente y cargar la lista de sucursales */
  it('Debe crear el componente y cargar la lista de sucursales', () => {
    expect(component).toBeTruthy();
    expect(sucursalesServiceMock.obtenerSucursales).toHaveBeenCalled();
    expect(component.sucursales.length).toBe(2);
    expect(component.sucursales[0].nombre).toBe('Sucursal Central');
  });

  /** @test Verifica que el método guardarSucursal rechace el guardado si faltan campos obligatorios. */
  it('Debe rechazar el guardado y mostrar alerta si faltan campos obligatorios', () => {
    component.sucursalesForm.reset();
    
    component.guardarSucursal();

    expect(component.sucursalesForm.touched).toBeTruthy();
    expect(component.tipoAlerta).toBe('danger');
    expect(component.mensajeAlerta).toContain('completa todos los campos obligatorios');
    expect(sucursalesServiceMock.agregarSucursal).not.toHaveBeenCalled();
  });

  /** @test Verifica que el método guardarSucursal rechace el guardado si se intenta usar un nombre que ya existe */
  it('Debe rechazar el guardado si se intenta usar un nombre que ya existe', () => {
    component.sucursalesForm.patchValue({
      ...nuevaSucursalValida,
      nombre: 'Sucursal Central' 
    });

    component.guardarSucursal();

    expect(component.tipoAlerta).toBe('danger');
    expect(component.mensajeAlerta).toContain('Ya existe una sucursal con ese nombre');
    expect(sucursalesServiceMock.agregarSucursal).not.toHaveBeenCalled();
  });

  /** @test Verifica que el método guardarSucursal llame al servicio agregarSucursal y resetee el formulario al enviar datos válidos */
  it('Debe llamar a agregarSucursal y resetear el formulario al enviar datos válidos', () => {
    component.sucursalesForm.patchValue(nuevaSucursalValida);
    component.modoEdicion = false;

    component.guardarSucursal();

    expect(sucursalesServiceMock.agregarSucursal).toHaveBeenCalledWith(nuevaSucursalValida);
    expect(component.tipoAlerta).toBe('success');
    expect(component.sucursalesForm.value.nombre).toBeNull(); // Se reseteó el formulario
  });

  /** @test Verifica que el método editarSucursal cargue correctamente los datos de la sucursal seleccionada en el formulario */
  it('Debe cargar los datos al formulario al iniciar la edición', () => {
    component.editarSucursal(mockSucursales[0]);

    expect(component.modoEdicion).toBe(true);
    expect(component.idEditando).toBe(1);
    expect(component.sucursalesForm.value.nombre).toBe('Sucursal Central');
    expect(component.sucursalesForm.value.ciudad).toBe('Santiago');
  });

  /** @test Verifica que el método guardarSucursal llame al servicio editarSucursal y salga del modo edición al guardar cambios */
  it('Debe llamar a editarSucursal al guardar los cambios en modo edición', () => {
    component.editarSucursal(mockSucursales[0]);
    
    component.sucursalesForm.patchValue({ ciudad: 'Valparaíso' });
    
    component.guardarSucursal();

    expect(sucursalesServiceMock.editarSucursal).toHaveBeenCalledWith({
      ...mockSucursales[0],
      ciudad: 'Valparaíso'
    });
    expect(component.modoEdicion).toBe(false);
    expect(component.tipoAlerta).toBe('success');
  });

  /** @test Verifica que el método eliminarSucursal llame al servicio eliminarSucursal si el usuario confirma la acción */
  it('Debe llamar a eliminarSucursal si el usuario confirma la acción', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.eliminarSucursal(1);

    expect(window.confirm).toHaveBeenCalled();
    expect(sucursalesServiceMock.eliminarSucursal).toHaveBeenCalledWith(1);
    expect(component.tipoAlerta).toBe('success');
  });

  /** @test Verifica que el método eliminarSucursal no llame al servicio eliminarSucursal si el usuario cancela la acción */
  it('No debe llamar a eliminarSucursal si el usuario cancela la acción', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.eliminarSucursal(1);

    expect(sucursalesServiceMock.eliminarSucursal).not.toHaveBeenCalled();
  });

  /** @test Verifica que el método restaurarDatosGP llame al servicio restaurarDatosDesdeAPI si el usuario confirma la acción */
  it('Debe restaurar los datos desde la API si el usuario acepta la confirmación', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.restaurarDatosGP();

    expect(sucursalesServiceMock.restaurarDatosDesdeAPI).toHaveBeenCalled();
    expect(component.tipoAlerta).toBe('success');
  });

  /** @test Verifica que el método restaurarDatosGP no llame al servicio restaurarDatosDesdeAPI si el usuario cancela la acción */
  it('Debe cancelar la edición y resetear el formulario al presionar cancelarEdicion', () => {
    component.editarSucursal(mockSucursales[0]);
    
    component.cancelarEdicion();

    expect(component.modoEdicion).toBe(false);
    expect(component.idEditando).toBeNull();
    expect(component.tipoAlerta).toBeNull();
  });

});