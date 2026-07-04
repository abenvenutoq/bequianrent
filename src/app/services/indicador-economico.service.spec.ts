import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IndicadoresEconomicos } from './indicador-economico.service';
import { IndicadorEconomico } from '../models/modelos';

/**
 * @description
 * Suite de Pruebas Unitarias para el servicio {@link TipoCambioService}.
 * Se encarga de verificar la correcta instanciación del servicio y el consumo
 * adecuado de la API pública externa (mindicador.cl) utilizando la sintaxis moderna 
 * de proveedores funcionales (provideHttpClientTesting).
 */
describe('TipoCambioService', () => {
  let service: IndicadoresEconomicos;
  let httpMock: HttpTestingController;

  /**
   * @description
   * Configuración inicial que se ejecuta antes de cada prueba.
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IndicadoresEconomicos,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    
    service = TestBed.inject(IndicadoresEconomicos);
    httpMock = TestBed.inject(HttpTestingController);
  });

  /**
   * @description
   * Limpieza que se ejecuta después de cada prueba.
   * La función `verify()` asegura que no queden peticiones HTTP pendientes
   * o abiertas accidentalmente, garantizando que cada test sea independiente.
   */
  afterEach(() => {
    httpMock.verify();
  });

  /**
   * @description
   * Verifica que el servicio se instancie correctamente dentro del ecosistema de Angular.
   */
  it('debería crearse el servicio correctamente', () => {
    expect(service).toBeTruthy();
  });

  /**
   * @description
   * Verifica que el método `obtenerDolar()` realice una petición GET a la URL correcta
   * y que mapee correctamente la respuesta JSON simulada.
   */
  it('debería ejecutar una petición GET y retornar el valor del Dólar', () => {

    const mockResponse = {
      version: '1.7.0',
      autor: 'mindicador.cl',
      codigo: 'dolar',
      nombre: 'Dólar observado',
      unidad_medida: 'Pesos',
      serie: [{ fecha: '2023-11-01T03:00:00.000Z', valor: 890.50 }]
    } as unknown as IndicadorEconomico; 

    service.obtenerDolar().subscribe((res) => {
      expect(res.codigo).toBe('dolar');
      expect(res.serie.length).toBe(1);
      expect(res.serie[0].valor).toBe(890.50);
    });

    const req = httpMock.expectOne('https://mindicador.cl/api/dolar');
    
    expect(req.request.method).toBe('GET');
    
    req.flush(mockResponse);
  });

  /**
   * @description
   * Verifica que el método `obtenerUf()` realice una petición GET a la URL correspondiente
   * de la UF y maneje correctamente los datos devueltos.
   */
  it('debería ejecutar una petición GET y retornar el valor de la UF', () => {
    const mockResponse = {
      version: '1.7.0',
      autor: 'mindicador.cl',
      codigo: 'uf',
      nombre: 'Unidad de fomento (UF)',
      unidad_medida: 'Pesos',
      serie: [{ fecha: '2023-11-01T03:00:00.000Z', valor: 36500.12 }]
    } as unknown as IndicadorEconomico;

    service.obtenerUf().subscribe((res) => {
      expect(res.codigo).toBe('uf');
      expect(res.serie[0].valor).toBe(36500.12);
    });

    const req = httpMock.expectOne('https://mindicador.cl/api/uf');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  /**
   * @description
   * Verifica que el método `obtenerUtm()` realice una petición GET a la URL de la UTM
   * de manera exitosa y asigne correctamente la respuesta.
   */
  it('debería ejecutar una petición GET y retornar el valor de la UTM', () => {
    const mockResponse = {
      version: '1.7.0',
      autor: 'mindicador.cl',
      codigo: 'utm',
      nombre: 'Unidad Tributaria Mensual (UTM)',
      unidad_medida: 'Pesos',
      serie: [{ fecha: '2023-11-01T03:00:00.000Z', valor: 63500 }]
    } as unknown as IndicadorEconomico;

    service.obtenerUtm().subscribe((res) => {
      expect(res.codigo).toBe('utm');
      expect(res.serie[0].valor).toBe(63500);
    });

    const req = httpMock.expectOne('https://mindicador.cl/api/utm');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

});