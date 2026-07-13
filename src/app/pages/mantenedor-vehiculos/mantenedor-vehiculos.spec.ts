import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { vi, describe, beforeEach, it, expect } from 'vitest'; // Importamos las herramientas de Vitest
import { MantenedorVehiculos } from './mantenedor-vehiculos';
import { VehiculosJsonServerService } from '../../services/vehiculos-json-server.services';

/**
 * @description
 * Suite de Pruebas Unitarias para el componente {@link MantenedorVehiculos}.
 * Verifica la lógica de negocio, validaciones del formulario y la interacción
 * con el servicio {@link VehiculosJsonServerService}.
 */
describe('MantenedorVehiculos - Pruebas de Negocio', () => {
  let component: MantenedorVehiculos;
  let fixture: ComponentFixture<MantenedorVehiculos>;
  let vehiculosServiceMock: any;

  const vehiculoValido = {
    id: 1,
    marca: 'Toyota',
    modelo: 'Yaris',
    tipo: 'Sedan',
    anio: 2023,
    precio: 25000,
    disponible: true,
    transmision: 'Manual',
    pasajeros: 5,
    rendimiento: '15 km/l',
    imagen: 'url-imagen',
    descripcion: 'Un auto genial'
  };

  /** Configuración inicial antes de cada prueba.*/
  beforeEach(async () => {
    vehiculosServiceMock = {
      getVehiculo: vi.fn().mockReturnValue(of([vehiculoValido])),
      addVehiculo: vi.fn().mockReturnValue(of({ ...vehiculoValido, id: 2 })),
      updateVehiculo: vi.fn().mockReturnValue(of(vehiculoValido)),
      deleteVehiculo: vi.fn().mockReturnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [MantenedorVehiculos, ReactiveFormsModule],
      providers: [
        { provide: VehiculosJsonServerService, useValue: vehiculosServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MantenedorVehiculos);
    component = fixture.componentInstance;
    
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    fixture.detectChanges();
  });

  /** @test Verifica la carga inicial de vehículos */
  it('Debería cargar la lista de vehículos al inicializar el componente', () => {
    expect(vehiculosServiceMock.getVehiculo).toHaveBeenCalled();
    expect(component.vehiculos.length).toBe(1);
    expect(component.vehiculos[0].marca).toBe('Toyota');
  });

  /** @test Verifica las validaciones del formulario */
  it('Debería rechazar el formulario y mostrar alerta si faltan campos obligatorios', () => {
    component.vehiculosForm.reset(); 
    
    component.guardarVehiculo();

    expect(vehiculosServiceMock.addVehiculo).not.toHaveBeenCalled();
    expect(component.tipoAlerta).toBe('warning');
    expect(component.mensajeAlerta).toContain('completa correctamente los campos');
  });

  /** @test Verifica la creación de un vehículo */
  it('Debería llamar a addVehiculo y mostrar éxito cuando el formulario es válido', () => {
    component.vehiculosForm.patchValue(vehiculoValido);
    component.modoEdicion = false;

    component.guardarVehiculo();

    expect(vehiculosServiceMock.addVehiculo).toHaveBeenCalled();
    expect(component.tipoAlerta).toBe('success');
    expect(component.mensajeAlerta).toBe('Vehículo agregado exitosamente a la flota.');
  });

  /** @test Verifica la edición de un vehículo */
  it('Debería cargar los datos en el formulario y subir el scroll al hacer clic en "Editar"', () => {
    component.editarVehiculo(vehiculoValido);

    expect(component.modoEdicion).toBe(true);
    expect(component.idEditando).toBe(1);
    expect(component.vehiculosForm.value.marca).toBe('Toyota');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  /** @test Verifica la actualización de un vehículo */
  it('Debería llamar a updateVehiculo al guardar los cambios de una edición', () => {
    component.editarVehiculo(vehiculoValido);
    component.vehiculosForm.patchValue({ precio: 30000 });

    component.guardarVehiculo();

    expect(vehiculosServiceMock.updateVehiculo).toHaveBeenCalled();
    expect(component.modoEdicion).toBe(false);
    expect(component.tipoAlerta).toBe('success');
  });

  /** @test Verifica la eliminación de un vehículo */
  it('Debería llamar a deleteVehiculo solo si el usuario confirma la alerta', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.eliminarVehiculo(1);

    expect(window.confirm).toHaveBeenCalled();
    expect(vehiculosServiceMock.deleteVehiculo).toHaveBeenCalledWith(1);
    expect(component.tipoAlerta).toBe('success');
  });

  /** @test Verifica que no se elimine un vehículo si el usuario cancela la alerta */
  it('NO debería llamar a deleteVehiculo si el usuario cancela la alerta', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.eliminarVehiculo(1);

    expect(vehiculosServiceMock.deleteVehiculo).not.toHaveBeenCalled();
  });

});