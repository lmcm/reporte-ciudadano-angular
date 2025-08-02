import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './inicio.component.html',
  styles: []
})
export class InicioComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  showMobileMenu = false;
  isAuthenticated = false;
  currentUser: any = null;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUser = user;
    });
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  comenzarNuevoReporte() {
    if (this.authService.isAuthenticated()) {
      // Usuario logueado → Ir directamente a nuevo reporte
      this.router.navigate(['/nuevo-reporte']);
    } else {
      // Usuario no logueado → Ir a login con redirección a nuevo reporte
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/nuevo-reporte' } 
      });
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/inicio']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }
}