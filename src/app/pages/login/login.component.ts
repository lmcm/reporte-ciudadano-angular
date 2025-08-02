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
        this.error = this.getFirebaseErrorMessage(error);
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
        this.error = this.getFirebaseErrorMessage(error);
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
        this.error = this.getFirebaseErrorMessage(error);
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

  private getFirebaseErrorMessage(error: any): string {
    const errorCode = error?.code || error?.message || '';
    
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Correo electrónico o contraseña incorrectos. Verifica tus datos e intenta nuevamente.';
      
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido deshabilitada. Contacta al administrador.';
      
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta nuevamente en unos minutos.';
      
      case 'auth/email-already-in-use':
        return 'Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión.';
      
      case 'auth/weak-password':
        return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
      
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      
      default:
        return 'Ocurrió un error inesperado. Intenta nuevamente.';
    }
  }

  private getResetPasswordErrorMessage(error: any): string {
    const errorCode = error?.code || error?.message || '';
    
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo electrónico.';
      
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      
      case 'auth/too-many-requests':
        return 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.';
      
      default:
        return 'Error al enviar el correo. Verifica tu email e intenta nuevamente.';
    }
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
        this.resetMessage = this.getResetPasswordErrorMessage(error);
        this.resetLoading = false;
      }
    });
  }
}