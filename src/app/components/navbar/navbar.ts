import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // 👈 Necesario para usar *ngIf

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  // Simulamos el objeto 'sesion' idéntico al tuyo. 
  // Modifica estos valores estáticos para probar los distintos estados:
  sesion = {
    loged: true,       // true o false
    rol: 'admin',      // 'admin' o 'cliente'
    nombre: 'Juan Pérez'
  };

  cerrarSesion() {
    // Al hacer clic, cambiamos los datos estáticos de la sesión
    this.sesion.loged = false;
    this.sesion.rol = '';
    this.sesion.nombre = '';
  }
}