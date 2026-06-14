import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VehiculoService } from '../../services/vehiculos.services';

@Component({
  selector: 'app-ver-autos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ver-autos.html',
  styleUrl: './ver-autos.css',
})
export class VerAutos {

  private vehiculos = inject(VehiculoService);

  vehiculo = this.vehiculos.getVehiculos();

  filtroMarca: string = '';
  filtroAnio: string = '';
  filtroDisponible: string = '';

  get listaFiltrada() {
    return this.vehiculo.filter(auto => {
      const cumpleMarca = this.filtroMarca === '' || auto.marca === this.filtroMarca;
      const cumpleAnio = this.filtroAnio === '' || auto.anio.toString() === this.filtroAnio;

      let cumpleDisp = true;
      if (this.filtroDisponible === 'true') cumpleDisp = auto.disponible === true;
      if (this.filtroDisponible === 'false') cumpleDisp = auto.disponible === false;

      return cumpleMarca && cumpleAnio && cumpleDisp;
    });
  }

  limpiarFiltros() {
    this.filtroMarca = '';
    this.filtroAnio = '';
    this.filtroDisponible = '';
  }

}