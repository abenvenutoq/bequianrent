import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { VerAutos } from './pages/ver-autos/ver-autos';
import { ReservarAuto } from './pages/reservar-auto/reservar-auto';
import { MisReservas } from './pages/mis-reservas/mis-reservas';
import { AdminPanel } from './pages/admin-panel/admin-panel';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { MiPerfil } from './pages/mi-perfil/mi-perfil';
import { EditarReserva } from './pages/editar-reserva/editar-reserva';
import { adminGuard } from './guards/admin.guard';
import { AdminEstadisticaVenta } from './pages/estadisticas-arriendos/estadisticas-arriendos';
import { SucursalesComponent } from './pages/sucursales/sucursales';
import { Testimonio } from './pages/testimonios/testimonios';
import { MantenedorSucursales } from './pages/mantenedor-sucursales/mantenedor-sucursales';
import { MantenedorVehiculos } from './pages/mantenedor-vehiculos/mantenedor-vehiculos';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'registro', component: Registro },
    { path: 'ver-autos', component: VerAutos },
    { path: 'app-navbar', component: Navbar},
    { path: 'app-footer', component: Footer},
    { path: 'mi-perfil', component: MiPerfil},
    { path: 'reservar-auto/:id', component: ReservarAuto }, 
    { path: 'mis-reservas', component: MisReservas },
    { path: 'admin-panel', component: AdminPanel, canActivate: [adminGuard] },
    { path: 'editar-reserva/:id', component: EditarReserva, canActivate: [adminGuard]},
    { path: 'estadisticas-arriendos', component: AdminEstadisticaVenta, canActivate: [adminGuard]},
    { path: 'sucursales', component: SucursalesComponent},
    { path: 'testimonios', component: Testimonio},
    { path: 'mantenedor-sucursales', component: MantenedorSucursales, canActivate: [adminGuard] },
    { path: 'mantenedor-vehiculos', component: MantenedorVehiculos, canActivate: [adminGuard] },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];