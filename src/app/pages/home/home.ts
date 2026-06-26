import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from "@angular/router";
import { VehiculoService } from '../../services/vehiculos.services';

/**
 * @description
 * Componente home o pagina inicial
 * muestra de manera aleatoria 3 vehiculos de localstorage
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  
  private vehiculos = inject(VehiculoService);

  vehiculosDestacados: any[] = [];

  ngOnInit(): void {

    const todosLosAutos = this.vehiculos.getVehiculosDisp(true);
    
    const autosMezclados = [...todosLosAutos].sort(() => 0.5 - Math.random());
    
    this.vehiculosDestacados = autosMezclados.slice(0, 3);
  }
}