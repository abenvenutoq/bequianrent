import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { EstadisticaService } from './estadisticas.services';
import { ArriendosMensuales } from '../models/modelos';

/**
 * @description
 * Pruebas unitarias para el servicio EstadisticaService.
 * Estas pruebas verifican la creación del servicio y su funcionalidad básica.
 */
describe('Estadisticas', () => {
  let service: EstadisticaService;
  let httpMock: HttpTestingController;

  const mockArriendos: ArriendosMensuales[] = [
    {
      mes: 'Enero',
      anio: 2026,
      totalArriendos: 120,
      ingresosGenerados: 4200000,
      vehiculoMasRentado: 'Toyota Yaris'
    },
    {
      mes: 'Febrero',
      anio: 2026,
      totalArriendos: 98,
      ingresosGenerados: 3650000,
      vehiculoMasRentado: 'Mazda 3 Sport'
    }
  ];

  /**
   * @description
   * Configuración inicial antes de cada prueba.
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EstadisticaService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(EstadisticaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });


  /** @test 1. Verifica que el servicio se haya creado correctamente */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /** @test 2. Debe hacer GET al endpoint de arriendos mensuales y retornar datos */
  it('Debe obtener arriendos mensuales con método GET', () => {
    service.obtenerArriendosMensuales().subscribe((data) => {
      expect(data).toEqual(mockArriendos);
      expect(data.length).toBe(2);
      expect(data[0].mes).toBe('Enero');
    });

    const req = httpMock.expectOne('/data/arriendos_mensuales.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockArriendos);
  });

  /** @test 3. Debe propagar el error cuando falla la petición */
  it('Debe propagar error HTTP en obtenerArriendosMensuales', () => {
    service.obtenerArriendosMensuales().subscribe({
      next: () => expect.unreachable('No debería emitir datos cuando falla la petición'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
      }
    });

    const req = httpMock.expectOne('/data/arriendos_mensuales.json');
    expect(req.request.method).toBe('GET');
    req.flush('Error de servidor', { status: 500, statusText: 'Internal Server Error' });
  });
});
