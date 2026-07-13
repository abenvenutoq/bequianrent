import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { TestimoniosService } from './testimonios.services';
import { Testimonios } from '../models/modelos';

/**
 * @description
 * Pruebas unitarias para el servicio TestimoniosService.
 * Estas pruebas verifican la creación del servicio y su funcionalidad básica.
 */
describe('Testimonios', () => {
  let service: TestimoniosService;
  let httpMock: HttpTestingController;

  const API_URL = 'https://abenvenutoq.github.io/bequianrent-api/testimonios.json';

  const mockTestimonios: Testimonios[] = [
    {
      id: 1,
      evaluacion: 5,
      nombre: 'Camila Rojas',
      autoRentado: 'Toyota Yaris',
      fechaEvaluacion: '2026-06-01',
      comentario: 'Excelente experiencia y atencion.'
    },
    {
      id: 2,
      evaluacion: 4,
      nombre: 'Diego Mena',
      autoRentado: 'Mazda 3 Sport',
      fechaEvaluacion: '2026-06-10',
      comentario: 'Auto en muy buenas condiciones.'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestimoniosService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(TestimoniosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  /**
   * @test 1. Verifica que el servicio se haya creado correctamente
   * Esta prueba asegura que la instancia del servicio TestimoniosService se haya inicializado sin errores.
   * Se espera que la instancia no sea nula ni indefinida.
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /** @test 2. Debe obtener testimonios desde la API con método GET */
  it('Debe consultar la API de testimonios y retornar la lista', () => {
    service.obtenerTestimonios().subscribe((testimonios) => {
      expect(testimonios).toEqual(mockTestimonios);
      expect(testimonios.length).toBe(2);
      expect(testimonios[0].evaluacion).toBe(5);
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush(mockTestimonios);
  });

  /** @test 3. Debe propagar error HTTP cuando la API falla */
  it('Debe propagar error cuando falla la petición de testimonios', () => {
    service.obtenerTestimonios().subscribe({
      next: () => expect.unreachable('No debería emitir datos cuando falla la API'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
      }
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush('Error de servidor', { status: 500, statusText: 'Internal Server Error' });
  });
});
