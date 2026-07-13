import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { vi, describe, beforeEach, it, expect } from 'vitest'; // Importamos las herramientas de Vitest
import { MantenedorVehiculos } from './mantenedor-vehiculos';
import { VehiculosJsonServerService } from '../../services/vehiculos-json-server.services';

describe('MantenedorVehiculos - Pruebas de Negocio', () => {
  let component: MantenedorVehiculos;
  let fixture: ComponentFixture<MantenedorVehiculos>;
  let vehiculosServiceMock: any;

  // Creamos un vehículo de prueba válido para reutilizar en los tests
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

  beforeEach(async () => {
    // 1. Simulamos el servicio usando la sintaxis de Vitest (vi.fn)
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
    
    // 2. Simulamos el scroll para que el entorno de pruebas (jsdom) no arroje error
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    fixture.detectChanges(); // Ejecuta ngOnInit
  });

  // --- SECCIÓN: CARGA INICIAL ---

  it('Debería cargar la lista de vehículos al inicializar el componente', () => {
    expect(vehiculosServiceMock.getVehiculo).toHaveBeenCalled();
    expect(component.vehiculos.length).toBe(1);
    expect(component.vehiculos[0].marca).toBe('Toyota');
  });

  // --- SECCIÓN: VALIDACIONES DEL FORMULARIO ---

  it('Debería rechazar el formulario y mostrar alerta si faltan campos obligatorios', () => {
    // Forzamos un formulario vacío (inválido por defecto)
    component.vehiculosForm.reset(); 
    
    component.guardarVehiculo();

    // Comprobamos que NO se llamó al servicio de creación
    expect(vehiculosServiceMock.addVehiculo).not.toHaveBeenCalled();
    // Comprobamos que mostró la alerta correcta
    expect(component.tipoAlerta).toBe('warning');
    expect(component.mensajeAlerta).toContain('completa correctamente los campos');
  });

  // --- SECCIÓN: CREACIÓN ---

  it('Debería llamar a addVehiculo y mostrar éxito cuando el formulario es válido', () => {
    // Llenamos el formulario con datos válidos
    component.vehiculosForm.patchValue(vehiculoValido);
    component.modoEdicion = false; // Aseguramos modo creación

    component.guardarVehiculo();

    expect(vehiculosServiceMock.addVehiculo).toHaveBeenCalled();
    expect(component.tipoAlerta).toBe('success');
    expect(component.mensajeAlerta).toBe('Vehículo agregado exitosamente a la flota.');
  });

  // --- SECCIÓN: EDICIÓN ---

  it('Debería cargar los datos en el formulario y subir el scroll al hacer clic en "Editar"', () => {
    component.editarVehiculo(vehiculoValido);

    expect(component.modoEdicion).toBe(true);
    expect(component.idEditando).toBe(1);
    expect(component.vehiculosForm.value.marca).toBe('Toyota');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('Debería llamar a updateVehiculo al guardar los cambios de una edición', () => {
    // Preparamos el componente para editar
    component.editarVehiculo(vehiculoValido);
    // Cambiamos un dato para simular la edición
    component.vehiculosForm.patchValue({ precio: 30000 });

    component.guardarVehiculo();

    expect(vehiculosServiceMock.updateVehiculo).toHaveBeenCalled();
    expect(component.modoEdicion).toBe(false); // Debería haber reseteado la edición
    expect(component.tipoAlerta).toBe('success');
  });

  // --- SECCIÓN: ELIMINACIÓN ---

  it('Debería llamar a deleteVehiculo solo si el usuario confirma la alerta', () => {
    // Simulamos que el usuario hizo clic en "Aceptar" usando vi.spyOn
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.eliminarVehiculo(1);

    expect(window.confirm).toHaveBeenCalled();
    expect(vehiculosServiceMock.deleteVehiculo).toHaveBeenCalledWith(1);
    expect(component.tipoAlerta).toBe('success');
  });

  it('NO debería llamar a deleteVehiculo si el usuario cancela la alerta', () => {
    // Simulamos que el usuario hizo clic en "Cancelar"
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.eliminarVehiculo(1);

    expect(vehiculosServiceMock.deleteVehiculo).not.toHaveBeenCalled();
  });

});