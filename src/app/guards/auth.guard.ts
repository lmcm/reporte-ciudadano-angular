import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const firebaseAuth = inject(FirebaseAuthService);
  const router = inject(Router);

  return firebaseAuth.user$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      }
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};

export const guestGuard: CanActivateFn = (route, state) => {
  const firebaseAuth = inject(FirebaseAuthService);
  const router = inject(Router);

  return firebaseAuth.user$.pipe(
    take(1),
    map(user => {
      if (!user) {
        return true;
      }
      router.navigate(['/nuevo-reporte']);
      return false;
    })
  );
};