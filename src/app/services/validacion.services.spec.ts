import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ValidacionService } from './validacion.services';

/**
 * @description
 * Suite de Pruebas Unitarias para el servicio {@link ValidacionService}.
 */
describe('Pruebas Unitarias - ValidacionService', () => {
  let service: ValidacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ValidacionService] });
    service = TestBed.inject(ValidacionService);
  });

  /** @test 1. Función Validar RUT Chileno */
  it('Debe validar correctamente el dígito verificador de un RUT (Módulo 11)', () => {
    const validador = service.validarRutChileno();
    
    // RUT Válido
    const controlValido = new FormControl('15940700-4');
    expect(validador(controlValido)).toBeNull(); // null significa que no hay errores

    // RUT Inválido
    const controlInvalido = new FormControl('15940700-k');
    expect(validador(controlInvalido)).toEqual({ rutInvalido: true });
  });

  /** @test 2. Función Validar Fechas de Reserva */
  it('Debe retornar error si la fecha de fin es anterior a la fecha de inicio', () => {
    const formGroup = new FormGroup({
      fechaDesde: new FormControl('2026-06-20'),
      fechaHasta: new FormControl('2026-06-15') // Viaje al pasado
    });

    const resultado = service.validarFechasReserva(formGroup);
    
    expect(resultado).toEqual({ fechaAnterior: true });
    expect(formGroup.get('fechaHasta')?.errors).toEqual({ fechaAnterior: true });
  });
});