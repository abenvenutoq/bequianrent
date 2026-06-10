import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { VerAutos } from './components/ver-autos/ver-autos';
import { ReservarAuto } from './components/reservar-auto/reservar-auto';
import { MisReservas } from './components/mis-reservas/mis-reservas';
import { AdminPanel } from './components/admin-panel/admin-panel';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'registro', component: Registro },
    { path: 'ver-autos', component: VerAutos },
    { path: 'app-navbar', component: Navbar},
    { path: 'app-footer', component: Footer},
    // La ruta dinámica sigue igual, lista para recibir el ID del vehículo
    { path: 'reservar-auto/:id', component: ReservarAuto }, 
    { path: 'mis-reservas', component: MisReservas },
    { path: 'admin-panel', component: AdminPanel },
    // Redirección  de seguridad si escriben una ruta que no existe
    { path: '**', redirectTo: '', pathMatch: 'full' }
];