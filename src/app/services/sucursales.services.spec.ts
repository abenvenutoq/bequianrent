import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SucursalesService } from './sucursales.services';
import { Sucursales } from '../models/modelos';

/**
 * @description
 * Suite de Pruebas Unitarias para el servicio {@link SucursalesService}.
 * Verifica la lectura/escritura en LocalStorage, el consumo de la API remota
 * y las operaciones CRUD sobre sucursales.
 */
describe('Pruebas Unitarias - SucursalesService', () => {
  let service: SucursalesService;
  let httpMock: HttpTestingController;

  const STORAGE_KEY = 'bequianrent_sucursales';
  const API_URL = 'https://abenvenutoq.github.io/bequianrent-api/sucursales.json';

  const mockSucursales: Sucursales[] = [
    { id: 1, nombre: 'Sucursal Central', direccion: 'Avenida 1', ciudad: 'Santiago', telefono: '12345678', jefeSucursal: 'Juan Pérez', horario: '09:00 - 18:00' },
    { id: 2, nombre: 'Sucursal Norte', direccion: 'Avenida 2', ciudad: 'Antofagasta', telefono: '87654321', jefeSucursal: 'Ana Gómez', horario: '10:00 - 19:00' }
  ];

  const store: Record<string, string> = {};
  const mockStorage = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach((key) => delete store[key]); })
  };

  beforeEach(() => {
    Object.keys(store).forEach((key) => delete store[key]);
    vi.stubGlobal('localStorage', mockStorage);

    TestBed.configureTestingModule({
      providers: [
        SucursalesService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(SucursalesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  /** @test 1. Creación del servicio */
  it('Debe crearse el servicio correctamente', () => {
    expect(service).toBeTruthy();
  });

  /** @test 2. obtenerSucursales desde LocalStorage */
  it('Debe devolver sucursales desde LocalStorage cuando ya existen datos locales', () => {
    store[STORAGE_KEY] = JSON.stringify(mockSucursales);

    service.obtenerSucursales().subscribe((sucursales) => {
      expect(sucursales).toEqual(mockSucursales);
      expect(sucursales.length).toBe(2);
    });

    httpMock.expectNone(API_URL);
  });

  /** @test 3. obtenerSucursales desde API */
  it('Debe consultar la API y guardar en LocalStorage cuando no hay datos locales', () => {
    service.obtenerSucursales().subscribe((sucursales) => {
      expect(sucursales).toEqual(mockSucursales);
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush(mockSucursales);

    expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(mockSucursales));
    expect(JSON.parse(store[STORAGE_KEY])).toEqual(mockSucursales);
  });

  /** @test 4. Manejo de error HTTP en obtenerSucursales */
  it('Debe propagar un error amigable cuando falla la petición HTTP', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    service.obtenerSucursales().subscribe({
      next: () => expect.unreachable('No debería emitir datos cuando la API falla'),
      error: (error: Error) => {
        expect(error.message).toBe('No pudimos cargar la lista de sucursales en este momento. Por favor, intenta de nuevo más tarde.');
      }
    });

    const req = httpMock.expectOne(API_URL);
    req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });

    expect(consoleSpy).toHaveBeenCalled();
  });

  /** @test 5. agregarSucursal con ID autoincremental */
  it('Debe agregar una sucursal y asignarle el siguiente ID disponible', () => {
    store[STORAGE_KEY] = JSON.stringify(mockSucursales);

    const nuevaSucursal: Sucursales = {
      id: 0,
      nombre: 'Sucursal Sur',
      direccion: 'Avenida 3',
      ciudad: 'Concepción',
      telefono: '11223344',
      jefeSucursal: 'Carlos Ruiz',
      horario: '08:00 - 17:00'
    };

    service.agregarSucursal(nuevaSucursal).subscribe((sucursales) => {
      expect(sucursales.length).toBe(3);
      expect(sucursales[2].id).toBe(3);
      expect(sucursales[2].nombre).toBe('Sucursal Sur');
    });

    const guardadas = JSON.parse(store[STORAGE_KEY]) as Sucursales[];
    expect(guardadas.length).toBe(3);
    expect(guardadas[2].id).toBe(3);
  });

  /** @test 6. agregarSucursal en lista vacía */
  it('Debe asignar ID 1 cuando se agrega la primera sucursal a una lista vacía', () => {
    const primeraSucursal: Sucursales = {
      id: 0,
      nombre: 'Sucursal Inicial',
      direccion: 'Calle 1',
      ciudad: 'Santiago',
      telefono: '99999999',
      jefeSucursal: 'María López',
      horario: '09:00 - 18:00'
    };

    service.agregarSucursal(primeraSucursal).subscribe((sucursales) => {
      expect(sucursales.length).toBe(1);
      expect(sucursales[0].id).toBe(1);
    });

    const guardadas = JSON.parse(store[STORAGE_KEY]) as Sucursales[];
    expect(guardadas[0].id).toBe(1);
  });

  /** @test 7. editarSucursal existente */
  it('Debe actualizar una sucursal existente por su ID', () => {
    store[STORAGE_KEY] = JSON.stringify(mockSucursales);

    const sucursalModificada: Sucursales = {
      ...mockSucursales[0],
      ciudad: 'Valparaíso',
      telefono: '55555555'
    };

    service.editarSucursal(sucursalModificada).subscribe((sucursales) => {
      expect(sucursales[0].ciudad).toBe('Valparaíso');
      expect(sucursales[0].telefono).toBe('55555555');
      expect(sucursales[1]).toEqual(mockSucursales[1]);
    });

    const guardadas = JSON.parse(store[STORAGE_KEY]) as Sucursales[];
    expect(guardadas[0].ciudad).toBe('Valparaíso');
  });

  /** @test 8. editarSucursal inexistente */
  it('No debe modificar la lista si el ID de la sucursal no existe', () => {
    store[STORAGE_KEY] = JSON.stringify(mockSucursales);

    const sucursalInexistente: Sucursales = {
      id: 99,
      nombre: 'Sucursal Fantasma',
      direccion: 'Sin dirección',
      ciudad: 'Sin ciudad',
      telefono: '00000000',
      jefeSucursal: 'Nadie',
      horario: '00:00 - 00:00'
    };

    service.editarSucursal(sucursalInexistente).subscribe((sucursales) => {
      expect(sucursales).toEqual(mockSucursales);
    });

    expect(JSON.parse(store[STORAGE_KEY])).toEqual(mockSucursales);
  });

  /** @test 9. eliminarSucursal */
  it('Debe eliminar una sucursal por su ID y persistir el cambio', () => {
    store[STORAGE_KEY] = JSON.stringify(mockSucursales);

    service.eliminarSucursal(1).subscribe((sucursales) => {
      expect(sucursales.length).toBe(1);
      expect(sucursales[0].id).toBe(2);
    });

    const guardadas = JSON.parse(store[STORAGE_KEY]) as Sucursales[];
    expect(guardadas.length).toBe(1);
    expect(guardadas[0].id).toBe(2);
  });

  /** @test 10. restaurarDatosDesdeAPI */
  it('Debe limpiar LocalStorage y volver a cargar datos desde la API', () => {
    store[STORAGE_KEY] = JSON.stringify(mockSucursales);

    service.restaurarDatosDesdeAPI().subscribe((sucursales) => {
      expect(sucursales).toEqual(mockSucursales);
    });

    expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    expect(store[STORAGE_KEY]).toBeUndefined();

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush(mockSucursales);

    expect(JSON.parse(store[STORAGE_KEY])).toEqual(mockSucursales);
  });
});
