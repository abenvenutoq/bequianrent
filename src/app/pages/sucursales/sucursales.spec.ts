import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { SucursalesComponent } from './sucursales';
import { SucursalesService } from '../../services/sucursales.services';

describe('SucursalesComponent - Pruebas de Negocio', () => {
  let component: SucursalesComponent;
  let fixture: ComponentFixture<SucursalesComponent>;
  let sucursalesServiceMock: any;

  // Creamos unos datos simulados para imitar la respuesta del servidor
  const mockSucursales = [
    { id: 1, nombre: 'Sucursal Central', direccion: 'Avenida Providencia 123', telefono: '+56912345678' },
    { id: 2, nombre: 'Sucursal Aeropuerto', direccion: 'Aeropuerto AMB', telefono: '+56987654321' }
  ];

  beforeEach(async () => {
    // Simulamos el servicio con Vitest para no hacer peticiones web reales durante los tests
    sucursalesServiceMock = {
      obtenerSucursales: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SucursalesComponent],
      providers: [
        { provide: SucursalesService, useValue: sucursalesServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SucursalesComponent);
    component = fixture.componentInstance;
  });

  // --- SECCIÓN: FLUJO EXITOSO ---

  it('Debería cargar la lista de sucursales correctamente y ocultar el loader', () => {
    // 1. Preparamos el mock para que responda con éxito
    sucursalesServiceMock.obtenerSucursales.mockReturnValue(of(mockSucursales));

    // 2. Ejecutamos ngOnInit (disparado por detectChanges)
    fixture.detectChanges(); 

    // 3. Comprobamos que todo funcionó según la lógica de tu negocio
    expect(sucursalesServiceMock.obtenerSucursales).toHaveBeenCalled();
    expect(component.sucursales.length).toBe(2);
    expect(component.sucursales[0].nombre).toBe('Sucursal Central');
    expect(component.cargando).toBe(false);
    expect(component.mensajeError).toBeNull();
  });

  // --- SECCIÓN: FLUJO CON ERRORES ---

  it('Debería mostrar un mensaje de error y apagar el loader si el servidor falla', () => {
    // 1. Preparamos el mock para que simule una caída del servidor
    const mensajeFallo = 'Error de conexión con la base de datos';
    sucursalesServiceMock.obtenerSucursales.mockReturnValue(throwError(() => new Error(mensajeFallo)));

    // 2. Ejecutamos ngOnInit
    fixture.detectChanges();

    // 3. Comprobamos que reaccionó correctamente al error
    expect(sucursalesServiceMock.obtenerSucursales).toHaveBeenCalled();
    expect(component.sucursales.length).toBe(0); // La lista debe quedar vacía
    expect(component.cargando).toBe(false);      // El loader debe desaparecer
    expect(component.mensajeError).toBe(mensajeFallo); // Debe guardar el mensaje de error para mostrarlo en el HTML
  });

});