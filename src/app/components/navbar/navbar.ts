import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Sesion } from '../../models/modelos';
import { AuthService } from '../../services/auth.services';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  sesion: Sesion | null = null;
  
  private sesionSub!: Subscription;

  ngOnInit(): void {

    this.sesionSub = this.authService.Sesion$.subscribe({
      next: (datosSesion) => {
        this.sesion = datosSesion;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    if (this.sesionSub) {
      this.sesionSub.unsubscribe();
    }
  }
}