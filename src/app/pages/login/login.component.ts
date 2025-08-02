import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { AuthService, LoginCredentials, RegisterData } from '../../services/auth.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private firebaseAuth = inject(FirebaseAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoginMode = true;
  email = '';
  password = '';
  nombre = '';
  apellidos = '';
  loading = false;
  error = '';
  private redirectPage = '/nuevo-reporte';
  showMobileMenu = false;
  showForgotPassword = false;
  resetEmail = '';
  resetLoading = false;
  resetMessage = '';

  ngOnInit() {
    // Verificar si ya está logueado y hay página de redirección
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      this.redirectPage = returnUrl;
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

    this.authService.login(credentials).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        console.log('Login exitoso, redirigiendo a:', this.redirectPage);
        setTimeout(() => {
          this.router.navigate([this.redirectPage]);
        }, 100);
      },
      error: (error) => {
        this.error = error.message || 'Error al iniciar sesión';
        console.error('Error en login:', error);
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

    this.authService.register(data).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        console.log('Registro exitoso, redirigiendo a:', this.redirectPage);
        setTimeout(() => {
          this.router.navigate([this.redirectPage]);
        }, 100);
      },
      error: (error) => {
        this.error = error.message || 'Error al registrar usuario';
        console.error('Error en registro:', error);
      }
    });
  }

  loginWithGoogle() {
    if (this.loading) return;
    
    this.loading = true;
    this.error = '';

    this.firebaseAuth.loginWithGoogle().subscribe({
      next: (result) => {
        console.log('Google login exitoso', result.user);
        this.router.navigate([this.redirectPage]);
      },
      error: (error) => {
        this.error = 'Error al iniciar sesión con Google: ' + error.message;
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

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  showForgotPasswordForm() {
    this.showForgotPassword = true;
    this.resetEmail = this.email;
    this.resetMessage = '';
  }

  hideForgotPasswordForm() {
    this.showForgotPassword = false;
    this.resetEmail = '';
    this.resetMessage = '';
  }

  sendPasswordReset() {
    if (!this.resetEmail || this.resetLoading) return;
    
    this.resetLoading = true;
    this.resetMessage = '';
    
    this.authService.resetPassword(this.resetEmail).subscribe({
      next: () => {
        this.resetMessage = 'Se ha enviado un enlace de recuperación a tu correo electrónico.';
        this.resetLoading = false;
      },
      error: (error) => {
        this.resetMessage = 'Error al enviar el correo: ' + (error.message || 'Intenta nuevamente');
        this.resetLoading = false;
      }
    });
  }
}