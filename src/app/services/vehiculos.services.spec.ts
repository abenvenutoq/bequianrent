import { TestBed } from '@angular/core/testing';
import { VehiculoService } from './vehiculos.services';

describe('Pruebas Unitarias - VehiculoService', () => {
  let service: VehiculoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [VehiculoService] });
    service = TestBed.inject(VehiculoService);
  });

  /** @test 1. Función Normalizar Ruta Imagen */
  it('Debe normalizar correctamente las rutas de las imágenes de los vehículos', () => {
    // Caso 1: Ruta vacía debe asignar placeholder
    expect(service.normalizarRutaImagen('')).toBe('img/autos/auto_placeholder.jpg');
    
    // Caso 2: Ruta con public/ debe limpiarse
    expect(service.normalizarRutaImagen('public/img/autos/yaris.jpg')).toBe('img/autos/yaris.jpg');
    
    // Caso 3: Nombre de archivo suelto debe concatenarse con la carpeta
    expect(service.normalizarRutaImagen('rio.png')).toBe('img/autos/rio.png');
  });

  /** @test 2. Función Actualizar Disponibilidad */
  it('Debe actualizar el estado de disponibilidad de un vehículo específico', () => {
    const mockVehiculos = [
      { id: 10, 
        marca: 'Kia', 
        modelo: 'Rio', 
        precio: 20, 
        anio: 2020, 
        imagen: '', 
        disponible: true, 
        tipo: 'Hatchback',
        transmision: 'Automatica',
        pasajeros: 5,
        rendimiento: '16',
        descripcion: 'descripcion' 
    }
    ];
    
    // Mockeamos lectura y escritura para aislar la prueba
    vi.spyOn(service as any, 'storageDisponible').mockReturnValue(true);
    vi.spyOn(service, 'getVehiculos').mockReturnValue(mockVehiculos);
    const guardarSpy = vi.spyOn(service, 'saveVehiculos').mockImplementation(() => {});

    // Cambiamos a false (auto arrendado)
    service.actualizarDisponibilidad(10, false);

    expect(guardarSpy).toHaveBeenCalled();
    const vehiculosGuardados = guardarSpy.mock.calls[0][0];
    expect(vehiculosGuardados[0].disponible).toBe(false);
  });
});