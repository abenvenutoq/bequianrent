import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.services';
import { VehiculoService } from '../../services/vehiculos.services';
import { ReservaService } from '../../services/reservas.services';
import { Vehiculo } from '../../models/modelos';
import { ValidacionService } from '../../services/validacion.services';

/**
 * @description
 * Componente encargado de gestionar el flujo de arriendo de un vehículo.
 * * Funcionalidades principales:
 * - Carga dinámicamente los datos del vehículo seleccionado mediante el parámetro de la URL.
 * - Implementa un formulario reactivo para capturar las fechas de inicio y término del arriendo.
 * - Calcula en tiempo real la cantidad de días de reserva y el costo total a pagar.
 * - Procesa la transacción, registra la reserva, descuenta el vehículo del inventario y redirige al usuario.
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

  constructor(
    private authService: AuthService,
    private vehiculoService: VehiculoService,
    private reservaService: ReservaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Ciclo de vida inicial del componente.
   * 1. Bloquea ejecución en SSR.
   * 2. Protege la ruta verificando que exista una sesión activa.
   * 3. Establece la fecha mínima de reserva al día actual.
   * 4. Inicializa el formulario reactivo con validaciones cruzadas.
   * 5. Recupera el ID del vehículo desde la URL y carga sus datos.
   */
  ngOnInit(): void {
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

    // Si el vehículo no existe o ya está arrendado, devolvemos al usuario al catálogo
    if (!this.authService.estaLogueado()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.vehiculo = this.vehiculoService.getVehiculosPorId(idParam);
      if (!this.vehiculo) {
        this.router.navigate(['/ver-autos']);
      }
    } else {
      this.router.navigate(['/ver-autos']);
    }
  }

  /**
   * Ejecuta el cálculo matemático para determinar la duración y costo de la reserva.
   * * Lógica:
   * 1. Convierte las fechas a milisegundos y calcula su diferencia.
   * 2. Transforma la diferencia a días (1000ms * 60s * 60m * 24h).
   * 3. Aplica un mínimo de 1 día de cobro si el cliente arrienda y devuelve el mismo día.
   * 4. Multiplica los días por el precio diario del vehículo.
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

    // Math.ceil para redondear siempre hacia arriba en caso de fracciones de día
    this.diasReserva = Math.ceil(diferenciaML / (1000 * 60 * 60 * 24));

    // Si se arrienda y devuelve el mismo día, se cobra al menos 1 día
    if (this.diasReserva <= 0) {
      this.diasReserva = 1;
    }

    this.totalPagar = this.diasReserva * this.vehiculo.precio;
  }

  /**
   * Finaliza y persiste la transacción de arriendo.
   * 1. Valida el estado del formulario y asocia la sesión al usuario registrado en la base de datos.
   * 2. Crea el objeto con el payload de la nueva reserva.
   * 3. Guarda la reserva mediante el `ReservaService`.
   * 4. Actualiza la disponibilidad del auto (`disponible: false`) usando el `VehiculoService`.
   * 5. Emite una alerta de éxito y redirige al panel de usuario (Mi Perfil).
   */
  confirmarReserva(): void {
    if (this.reservaForm.valid && this.diasReserva > 0 && this.vehiculo) {
      
      //1. Valida el estado del formulario y asocia la sesión al usuario registrado en la base de datos.
      const sesion = this.authService.obtenerSesion();
      if (!sesion) return;

      const usuarios = this.authService.obtenerUsusario();
      const usuarioActual = usuarios.find(u => u.correo === sesion.correo);
      
      if (!usuarioActual) {
        alert("Error: No se encontró el usuario en la base de datos.");
        return;
      }

      //2. Crea el objeto con el payload de la nueva reserva.
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

      // 3. Guarda la reserva mediante el `ReservaService`.
      this.reservaService.crearReserva(nuevaReserva);

      // 4. Actualiza la disponibilidad del auto (`disponible: false`) usando el `VehiculoService`.
      this.vehiculoService.actualizarDisponibilidad(this.vehiculo.id, false);

      // 5. Emite una alerta de éxito y redirige al panel de usuario (Mi Perfil).
      alert("¡Reserva confirmada con éxito!");
      this.router.navigate(['/mis-reservas']);
    }
  }
}