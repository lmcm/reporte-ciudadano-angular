import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  goToReports() {
    this.router.navigate(['/mis-reportes']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}