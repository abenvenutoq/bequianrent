import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.services';
import { ReservaService } from '../../services/reservas.services';
import { Vehiculo } from '../../models/modelos';
import { ValidacionService } from '../../services/validacion.services';

// Importamos el nuevo servicio de JSON Server en lugar de VehiculoService
import { VehiculosJsonServerService } from '../../services/vehiculos-json-server.services';

/**
 * @description
 * Componente encargado de gestionar el flujo de arriendo de un vehículo.
 * * Funcionalidades principales:
 * - Carga dinámicamente los datos del vehículo seleccionado desde JSON Server.
 * - Implementa un formulario reactivo para capturar las fechas de inicio y término del arriendo.
 * - Calcula en tiempo real la cantidad de días de reserva y el costo total a pagar.
 * - Procesa la transacción, registra la reserva, descuenta el vehículo del inventario en el servidor y redirige al usuario.
 */
@Component({
  selector: 'app-reservar-auto',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './reservar-auto.html',
  styleUrl: './reservar-auto.css',
})
export class ReservarAuto implements OnInit {
  
  /** Objeto que almacena los detalles del vehículo actualmente en proceso de reserva. */
  vehiculo: Vehiculo | undefined;
  
  // Agregamos estado de carga para la vista
  cargando: boolean = true;
  
  /** Cantidad calculada de días totales que durará el arriendo. */
  diasReserva: number = 0;
  /** Monto total a pagar calculado en base al precio diario del vehículo y los días de reserva. */
  totalPagar: number = 0;
  /** Almacena la fecha actual formateada para bloquear la selección de días pasados en el input de tipo Date. */
  fechaMinima!: string;

  /** Formulario reactivo que controla las fechas de la reserva. */
  reservaForm!: FormGroup;
  
  /** Servicio inyectado para la construcción ágil del formulario. */
  private fb = inject(FormBuilder);
  /** Servicio de validaciones personalizadas de reglas de negocio. */
  private ValidacionService = inject(ValidacionService);
  /** Nuevo servicio asíncrono para consumir JSON Server */
  private vehiculosService = inject(VehiculosJsonServerService);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private authService: AuthService,
    private reservaService: ReservaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Ciclo de vida inicial del componente.
   * 1. Protege la ruta verificando que exista una sesión activa.
   * 2. Establece la fecha mínima de reserva al día actual.
   * 3. Inicializa el formulario reactivo con validaciones cruzadas.
   * 4. Recupera el ID del vehículo desde la URL y hace la petición asíncrona para cargar sus datos.
   */
  ngOnInit(): void {
    if (!this.authService.isBrowser()) return;
    
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];

    // Inicializamos el form con un validador a nivel de grupo
    this.reservaForm = this.fb.group({
      fechaDesde: ['', [Validators.required]],
      fechaHasta: ['', [Validators.required]]
    }, {
      validators: [this.ValidacionService.validarFechasReserva.bind(this.ValidacionService)]
    });

    // Detectamos cambios en las fechas para recalcular el precio automáticamente
    this.reservaForm.valueChanges.subscribe(() => {
      this.calcularTotal();
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.cargarVehiculo(idParam);
    } else {
      this.router.navigate(['/ver-autos']);
    }
  }

  /**
   * Obtiene los datos del vehículo desde el servidor de forma asíncrona
   */
  private cargarVehiculo(id: string): void {
    this.cargando = true;
    
    // Obtenemos el listado de vehículos y buscamos el que coincida con la ID
    this.vehiculosService.getVehiculo().subscribe({
      next: (vehiculos) => {
        this.vehiculo = vehiculos.find(v => v.id.toString() === id);
        
        if (!this.vehiculo || !this.vehiculo.disponible) {
          // Si no existe o no está disponible, lo sacamos de aquí
          this.router.navigate(['/ver-autos']);
        } else {
          this.cargando = false;
          this.cdr.detectChanges(); // Actualizamos la vista
        }
      },
      error: (err) => {
        console.error('Error al cargar el vehículo:', err);
        this.router.navigate(['/ver-autos']);
      }
    });
  }

  /**
   * Ejecuta el cálculo matemático para determinar la duración y costo de la reserva.
   */
  calcularTotal(): void {
    const fechaDesde = this.reservaForm.get('fechaDesde')?.value;
    const fechaHasta = this.reservaForm.get('fechaHasta')?.value;

    if (!fechaDesde || !fechaHasta || !this.vehiculo) {
      this.diasReserva = 0;
      this.totalPagar = 0;
      return;
    }

    const inicio = new Date(fechaDesde);
    const fin = new Date(fechaHasta);
    const diferenciaML = fin.getTime() - inicio.getTime();

    this.diasReserva = Math.ceil(diferenciaML / (1000 * 60 * 60 * 24));

    if (this.diasReserva <= 0) {
      this.diasReserva = 1;
    }

    this.totalPagar = this.diasReserva * this.vehiculo.precio;
  }

  /**
   * Finaliza y persiste la transacción de arriendo.
   * Modificado para interactuar con JSON Server.
   */
  confirmarReserva(): void {
    if (this.reservaForm.valid && this.diasReserva > 0 && this.vehiculo) {
      
      const sesion = this.authService.obtenerSesion();
      if (!sesion) return;

      const usuarios = this.authService.obtenerUsuario();
      const usuarioActual = usuarios.find(u => u.correo === sesion.correo);
      
      if (!usuarioActual) {
        alert("Error: No se encontró el usuario en la base de datos.");
        return;
      }

      const fechaDesde = this.reservaForm.get('fechaDesde')?.value;
      const fechaHasta = this.reservaForm.get('fechaHasta')?.value;

      const nuevaReserva = {
        idVehiculo: this.vehiculo.id,
        correo: usuarioActual.correo,
        rut: usuarioActual.rut,
        fechaDesde: fechaDesde,
        fechaHasta: fechaHasta,
        total: this.totalPagar,
        estado: 'Confirmada'
      };

      // Clonamos el vehículo actual y le cambiamos la disponibilidad a false
      const vehiculoActualizado: Vehiculo = { 
        ...this.vehiculo, 
        disponible: false 
      };

      // 1. Primero actualizamos el vehículo en JSON Server de forma asíncrona
      this.vehiculosService.updateVehiculo(vehiculoActualizado).subscribe({
        next: () => {
          // 2. Si el vehículo se actualizó con éxito, guardamos la reserva
          this.reservaService.crearReserva(nuevaReserva);
          
          alert("¡Reserva confirmada con éxito!");
          this.router.navigate(['/mis-reservas']);
        },
        error: (err) => {
          console.error("Error actualizando la disponibilidad:", err);
          alert("Ocurrió un error al procesar tu reserva con el servidor. Intenta nuevamente.");
        }
      });
    } else {
      this.reservaForm.markAllAsTouched();
    }
  }
}