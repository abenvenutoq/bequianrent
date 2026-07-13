import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from "@angular/router";
import { Vehiculo } from '../../models/modelos';
import { VehiculosJsonServerService } from '../../services/vehiculos-json-server.services';

/**
 * @description
 * Componente home o pagina inicial
 * Obtiene los vehículos desde la API y muestra 3 de manera aleatoria.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  
  private vehiculos = inject(VehiculosJsonServerService);
  private cdr = inject(ChangeDetectorRef); // Inyectamos el ChangeDetectorRef

  vehiculosDestacados: Vehiculo[] = [];
  cargando = true;
  errorCarga = false;

  ngOnInit(): void {
    this.vehiculos.getVehiculo().subscribe({
      next: (todosLosAutos) => {
        // 1. Filtramos solo los disponibles
        const autosDisponibles = todosLosAutos.filter(auto => auto.disponible);
        // 2. Los mezclamos aleatoriamente
        const autosMezclados = [...autosDisponibles].sort(() => 0.5 - Math.random());
        // 3. Tomamos los primeros 3
        this.vehiculosDestacados = autosMezclados.slice(0, 3);
        
        // 4. Actualizamos el estado y la vista
        this.cargando = false;
        this.cdr.detectChanges(); // Le avisamos a Angular que ya tenemos los autos
      },
      error: () => {
        this.vehiculosDestacados = [];
        this.errorCarga = true;
        this.cargando = false;
        this.cdr.detectChanges(); // Le avisamos a Angular que muestre el error
      }
    });
  }
}