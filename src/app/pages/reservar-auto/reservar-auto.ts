import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.services.';
import { VehiculoService } from '../../services/vehiculos.services';
import { ReservaService } from '../../services/reservas.services';
import { Vehiculo } from '../../models/modelos';

@Component({
  selector: 'app-reservar-auto',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './reservar-auto.html',
  styleUrl: './reservar-auto.css',
})
export class ReservarAuto implements OnInit {
  
  vehiculo: Vehiculo | undefined;
  
  fechaDesde: string = '';
  fechaHasta: string = '';
  diasReserva: number = 0;
  totalPagar: number = 0;
  fechaMinima!: string;

  constructor(
  private authService: AuthService,
  private vehiculoService: VehiculoService,
  private reservaService: ReservaService,
  private route: ActivatedRoute,
  private router: Router
) {}

  ngOnInit(): void {

    const hoy = new Date();

    this.fechaMinima = hoy.toISOString().split('T')[0];

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

  calcularTotal(): void {
    if (!this.fechaDesde || !this.fechaHasta || !this.vehiculo) {
      this.diasReserva = 0;
      this.totalPagar = 0;
      return;
    }

    const inicio = new Date(this.fechaDesde);
    const fin = new Date(this.fechaHasta);
    const diferenciaML = fin.getTime() - inicio.getTime();

    this.diasReserva = Math.ceil(diferenciaML / (1000 * 60 * 60 * 24));

    if (this.diasReserva <= 0) {
      this.diasReserva = 1;
    }

    this.totalPagar = this.diasReserva * this.vehiculo.precio;
  }

  confirmarReserva(): void {
  if (this.diasReserva > 0 && this.vehiculo) {
    
    const sesion = this.authService.obtenerSesion();
    if (!sesion) return;

    const usuarios = this.authService.obtenerUsusario();
    const usuarioActual = usuarios.find(u => u.correo === sesion.correo);

    if (!usuarioActual) {
      alert("Error: No se encontró el usuario en la base de datos.");
      return;
    }

    const nuevaReserva = {
      idVehiculo: this.vehiculo.id,
      correo: usuarioActual.correo,
      rut: usuarioActual.rut,
      fechaDesde: new Date(this.fechaDesde),
      fechaHasta: new Date(this.fechaHasta),
      total: this.totalPagar,
      estado: 'Confirmada'
    };

    this.reservaService.crearReserva(nuevaReserva);

    this.vehiculoService.actualizarDisponibilidad(this.vehiculo.id, false);

    alert("¡Reserva confirmada con éxito!");
    this.router.navigate(['/mis-reservas']);
  }
}
}