import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { FirebaseAuthService } from '../../services/firebase-auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styles: []
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private firebaseAuth = inject(FirebaseAuthService);

  mode = '';
  oobCode = '';
  email = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = false;

  ngOnInit() {
    this.mode = this.route.snapshot.queryParams['mode'] || '';
    this.oobCode = this.route.snapshot.queryParams['oobCode'] || '';

    if (this.mode === 'resetPassword' && this.oobCode) {
      this.verifyCode();
    } else {
      this.error = 'Enlace inválido o expirado';
    }
  }

  private async verifyCode() {
    try {
      this.loading = true;
      const auth = this.firebaseAuth.getAuth();
      this.email = await verifyPasswordResetCode(auth, this.oobCode);
      this.loading = false;
    } catch (error: any) {
      this.error = 'El enlace es inválido o ha expirado';
      this.loading = false;
    }
  }

  async resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.newPassword.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    try {
      this.loading = true;
      this.error = '';
      const auth = this.firebaseAuth.getAuth();
      await confirmPasswordReset(auth, this.oobCode, this.newPassword);
      this.success = true;
      this.loading = false;
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } catch (error: any) {
      this.error = 'Error al actualizar la contraseña: ' + error.message;
      this.loading = false;
    }
  }
}