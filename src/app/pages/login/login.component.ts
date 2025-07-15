import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, LoginCredentials, RegisterData } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoginMode = true;
  email = '';
  password = '';
  nombre = '';
  apellidos = '';
  loading = false;
  error = '';
  private redirectPage = '/mis-reportes';

  ngOnInit() {
    // Verificar si ya está logueado y hay página de redirección
    const page = this.route.snapshot.queryParams['page'];
    if (page) {
      this.redirectPage = '/' + page;
      if (this.authService.isAuthenticated()) {
        this.router.navigate([this.redirectPage]);
        return;
      }
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.clearForm();
  }

  onSubmit() {
    if (this.loading) return;
    
    this.loading = true;
    this.error = '';

    if (this.isLoginMode) {
      this.login();
    } else {
      this.register();
    }
  }

  private login() {
    const credentials: LoginCredentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate([this.redirectPage]);
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  private register() {
    const data: RegisterData = {
      nombre: this.nombre,
      apellidos: this.apellidos,
      email: this.email,
      password: this.password
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.router.navigate([this.redirectPage]);
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  private clearForm() {
    this.email = '';
    this.password = '';
    this.nombre = '';
    this.apellidos = '';
    this.error = '';
  }
}