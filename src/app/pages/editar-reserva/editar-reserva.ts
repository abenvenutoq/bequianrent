import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ReservaService } from '../../services/reservas.services';
import { VehiculoService } from '../../services/vehiculos.services';
import { Reserva, Vehiculo } from '../../models/modelos';
import { ValidacionService } from '../../services/validacion.services';

@Component({
  selector: 'app-editar-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './editar-reserva.html',
  styleUrls: ['./editar-reserva.css']
})
export class EditarReserva implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservaService = inject(ReservaService);
  private vehiculoService = inject(VehiculoService);
  private validacionService = inject(ValidacionService);

  editarForm!: FormGroup;
  reservaId!: string | number;
  reservaActual: Reserva | undefined;
  fechaMinima!: string;
  
  vehiculos: Vehiculo[] = [];
  totalCalculado: number = 0;

  ngOnInit(): void {
    // 1. Obtener el ID de la reserva desde la URL
    this.reservaId = this.route.snapshot.paramMap.get('id')!;
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
    
    // 2. Buscar la reserva
    const todasReservas = this.reservaService.obtenerReservas();
    this.reservaActual = todasReservas.find(r => String(r.id) === String(this.reservaId));

    if (!this.reservaActual) {
      alert('Reserva no encontrada');
      this.router.navigate(['/admin-panel']);
      return;
    }

    // 3. Obtener vehículos para el Select
    this.vehiculos = this.vehiculoService.getVehiculos(); // o el método equivalente en tu servicio

    // 4. Inicializar formulario con los datos actuales
    this.editarForm = this.fb.group({
      vehiculoId: [this.reservaActual.idVehiculo, Validators.required],
      fechaDesde: [this.reservaActual.fechaDesde, Validators.required],
      fechaHasta: [this.reservaActual.fechaHasta, Validators.required]
    }, {
        validators: [this.validacionService.validarFechasReserva.bind(this.validacionService)]
    });

    this.totalCalculado = this.reservaActual.total || 0;

    // 5. Escuchar cambios dinámicos en el formulario para recalcular el precio
    this.editarForm.valueChanges.subscribe(() => {
      this.recalcularTotal();
    });
  }

  recalcularTotal(): void {
    const { vehiculoId, fechaDesde, fechaHasta } = this.editarForm.value;
    if (!vehiculoId || !fechaDesde || !fechaHasta) return;

    const autoSeleccionado = this.vehiculos.find(v => String(v.id) === String(vehiculoId));
    if (!autoSeleccionado) return;

    const inicio = new Date(fechaDesde);
    const fin = new Date(fechaHasta);
    
    // Si la fecha de fin es menor o igual a la de inicio, no calculamos
    if (fin <= inicio) {
        this.totalCalculado = 0;
        return;
    }

    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Asegúrate de que tu modelo "Vehiculo" tenga la propiedad 'precio' o 'precioPorDia'
    this.totalCalculado = diffDays * (autoSeleccionado.precio || autoSeleccionado.precio || 0);
  }

  guardarCambios(): void {
    if (this.editarForm.invalid || this.totalCalculado <= 0) return;

    const { vehiculoId, fechaDesde, fechaHasta } = this.editarForm.value;

    // Lógica para actualizar estados de los vehículos si cambió de auto
    if (String(this.reservaActual!.idVehiculo) !== String(vehiculoId)) {
        const autoAntiguo = this.vehiculos.find(v => String(v.id) === String(this.reservaActual!.idVehiculo));
        const autoNuevo = this.vehiculos.find(v => String(v.id) === String(vehiculoId));

        if (autoAntiguo) autoAntiguo.disponible = true;  // Liberamos el anterior
        if (autoNuevo) autoNuevo.disponible = false;     // Ocupamos el nuevo

        // Guardar cambios en el localStorage o DB simulada
        this.vehiculoService.saveVehiculos(this.vehiculos);
    }

    // Actualizar la reserva
    const todasReservas = this.reservaService.obtenerReservas();
    const index = todasReservas.findIndex(r => String(r.id) === String(this.reservaId));
    
    if (index !== -1) {
        todasReservas[index].idVehiculo = vehiculoId;
        todasReservas[index].fechaDesde = fechaDesde;
        todasReservas[index].fechaHasta = fechaHasta;
        todasReservas[index].total = this.totalCalculado;
        
        this.reservaService.guardarReservas(todasReservas);
        
        alert('Reserva modificada con éxito');
        this.router.navigate(['/admin-panel'], { queryParams: { vista: 'reservas' } });
    }
  }
}