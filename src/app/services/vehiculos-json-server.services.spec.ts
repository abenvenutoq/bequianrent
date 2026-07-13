import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VehiculosJsonServerService } from './vehiculos-json-server.services';
import { Vehiculo } from '../models/modelos';

/**
 * @description
 * Suite de Pruebas Unitarias para el servicio {@link VehiculosJsonServerService}.
 * Verifica la lectura/escritura en LocalStorage, el consumo de la API remota
 * y las operaciones CRUD sobre vehículos.
 */
describe('VehiculosJsonServerService', () => {
  let service: VehiculosJsonServerService;
  let httpMock: HttpTestingController;
  
  const apiUrl = 'http://localhost:3000/vehiculos';

  /** Mock de vehículos para pruebas unitarias */
  const mockVehiculos: Vehiculo[] = [
    { 
      id: 1, 
      marca: 'Mazda', 
      modelo: '3 Sport', 
      tipo: 'Hatchback',
      anio: 2023,
      precio: 35000, 
      disponible: true,
      transmision: 'Manual',
      pasajeros: 5,
      rendimiento: '15 km/l',
      imagen: 'mazda3sport.jpg',
      descripcion: 'Vehículo deportivo, compacto y con excelente respuesta en carretera.'
    },
    { 
      id: 2, 
      marca: 'Toyota', 
      modelo: 'Yaris HB', 
      tipo: 'Hatchback',
      anio: 2022,
      precio: 25000, 
      disponible: false,
      transmision: 'Automática',
      pasajeros: 5,
      rendimiento: '18 km/l',
      imagen: 'toyota_yaris_hb.jpg',
      descripcion: 'El auto perfecto para moverte por la ciudad con máxima economía.'
    }
  ];

  /** Configuración del módulo de pruebas antes de cada test */
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VehiculosJsonServerService]
    });
    service = TestBed.inject(VehiculosJsonServerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  /** Verificación después de cada test */
  afterEach(() => {
    httpMock.verify();
  });

  /** @test Verifica la creación del servicio */
  it('debería crearse el servicio correctamente', () => {
    expect(service).toBeTruthy();
  });

  /** @test Obtiene la lista de vehículos usando GET */
  it('debería obtener la lista de vehículos (getVehiculo) usando GET', () => {
    service.getVehiculo().subscribe((vehiculos) => {
      expect(vehiculos.length).toBe(2);
      expect(vehiculos).toEqual(mockVehiculos);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET'); 
    req.flush(mockVehiculos); 
  });

  /** @test Agrega un nuevo vehículo usando POST */
  it('debería agregar un nuevo vehículo (addVehiculo) usando POST', () => {
    const nuevoVehiculo: Omit<Vehiculo, 'id'> = {
      marca: 'Volkswagen',
      modelo: 'Golf',
      tipo: 'Hatchback',
      anio: 2024,
      precio: 40000,
      disponible: true,
      transmision: 'Automática',
      pasajeros: 5,
      rendimiento: '14 km/l',
      imagen: 'vw_golf.jpg',
      descripcion: 'Un clásico moderno con tecnología de punta.'
    };

    const vehiculoCreado: Vehiculo = { ...nuevoVehiculo, id: 3 };

    service.addVehiculo(nuevoVehiculo).subscribe((vehiculo) => {
      expect(vehiculo).toEqual(vehiculoCreado);
      expect(vehiculo.id).toBe(3);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST'); 
    expect(req.request.body).toEqual(nuevoVehiculo);
    req.flush(vehiculoCreado); 
  });

  /** @test Actualiza un vehículo existente usando PUT */
  it('debería actualizar un vehículo existente (updateVehiculo) usando PUT', () => {
    const vehiculoModificado: Vehiculo = { 
      id: 1, 
      marca: 'Mazda', 
      modelo: '3 Sport', 
      tipo: 'Hatchback',
      anio: 2023,
      precio: 32000,
      disponible: false,
      transmision: 'Manual',
      pasajeros: 5,
      rendimiento: '15 km/l',
      imagen: 'mazda3sport.jpg',
      descripcion: 'Vehículo deportivo, compacto y con excelente respuesta en carretera.'
    };

    service.updateVehiculo(vehiculoModificado).subscribe((vehiculo) => {
      expect(vehiculo).toEqual(vehiculoModificado);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`); 
    expect(req.request.method).toBe('PUT'); 
    expect(req.request.body).toEqual(vehiculoModificado);
    req.flush(vehiculoModificado);
  });

  /** @test Elimina un vehículo usando DELETE */
  it('debería eliminar un vehículo (deleteVehiculo) usando DELETE', () => {
    const idAEliminar = 2;

    service.deleteVehiculo(idAEliminar).subscribe((respuesta) => {
      expect(respuesta).toBeNull(); 
    });

    const req = httpMock.expectOne(`${apiUrl}/${idAEliminar}`);
    expect(req.request.method).toBe('DELETE'); 
    req.flush(null); 
  });
});