import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, user } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private auth = inject(Auth);
  private googleProvider = new GoogleAuthProvider();
  
  user$ = user(this.auth);

  // Login con email y password
  loginWithEmail(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  // Registro con email y password
  registerWithEmail(email: string, password: string, displayName?: string): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(result => {
        if (displayName) {
          return from(this.updateProfile(result.user, { displayName })).pipe(
            map(() => result)
          );
        }
        return of(result);
      })
    );
  }

  // Actualizar perfil del usuario
  private async updateProfile(user: any, profile: { displayName?: string; photoURL?: string }) {
    const { updateProfile } = await import('firebase/auth');
    return updateProfile(user, profile);
  }

  // Login con Google
  loginWithGoogle(): Observable<any> {
    return from(signInWithPopup(this.auth, this.googleProvider));
  }

  // Logout
  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }
}