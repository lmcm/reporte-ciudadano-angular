import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import { FirebaseAuthService } from './firebase-auth.service';
import { UserProfileService, UserProfile } from './user-profile.service';
import { User } from 'firebase/auth';

export interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseAuth = inject(FirebaseAuthService);
  private userProfileService = inject(UserProfileService);
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    this.firebaseAuth.user$.subscribe(firebaseUser => {
      if (firebaseUser) {
        // Cargar datos completos desde Firestore
        this.userProfileService.getUserProfile(firebaseUser.uid).subscribe(profile => {
          if (profile) {
            const usuario: Usuario = {
              id: profile.uid,
              nombre: profile.nombre,
              apellidos: profile.apellidos,
              email: profile.email,
              telefono: profile.telefono,
              fechaRegistro: profile.fechaRegistro
            };
            this.setCurrentUser(usuario);
          } else {
            // Fallback si no hay perfil en Firestore
            const usuario: Usuario = {
              id: firebaseUser.uid,
              nombre: firebaseUser.displayName?.split(' ')[0] || 'Usuario',
              apellidos: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              email: firebaseUser.email || '',
              fechaRegistro: new Date(firebaseUser.metadata.creationTime || Date.now())
            };
            this.setCurrentUser(usuario);
          }
        });
      } else {
        this.setCurrentUser(null);
      }
    });
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  getCurrentUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user ? user.email : null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  private setCurrentUser(user: Usuario | null): void {
    this.currentUserSubject.next(user);
  }

  register(data: RegisterData): Observable<Usuario> {
    const displayName = `${data.nombre} ${data.apellidos}`;
    return this.firebaseAuth.registerWithEmail(data.email, data.password, displayName).pipe(
      switchMap(result => {
        const userProfile: UserProfile = {
          uid: result.user.uid,
          nombre: data.nombre,
          apellidos: data.apellidos,
          email: data.email,
          fechaRegistro: new Date()
        };
        
        // Guardar perfil completo en Firestore
        return this.userProfileService.saveUserProfile(userProfile).pipe(
          map(() => {
            const usuario: Usuario = {
              id: result.user.uid,
              nombre: data.nombre,
              apellidos: data.apellidos,
              email: data.email,
              fechaRegistro: new Date()
            };
            return usuario;
          })
        );
      })
    );
  }

  login(credentials: LoginCredentials): Observable<Usuario> {
    return this.firebaseAuth.loginWithEmail(credentials.email, credentials.password).pipe(
      map(result => {
        const usuario: Usuario = {
          id: result.user.uid,
          nombre: result.user.displayName?.split(' ')[0] || 'Usuario',
          apellidos: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          email: result.user.email || '',
          fechaRegistro: new Date(result.user.metadata.creationTime || Date.now())
        };
        return usuario;
      })
    );
  }

  logout(): Observable<void> {
    return this.firebaseAuth.logout();
  }

  resetPassword(email: string): Observable<void> {
    return this.firebaseAuth.resetPassword(email);
  }

  updateUserProfile(profileData: Partial<Usuario>): Observable<Usuario> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const updatedProfile: UserProfile = {
      uid: currentUser.id,
      nombre: profileData.nombre || currentUser.nombre,
      apellidos: profileData.apellidos || currentUser.apellidos,
      email: profileData.email || currentUser.email,
      telefono: profileData.telefono || currentUser.telefono,
      fechaRegistro: currentUser.fechaRegistro
    };

    // Actualizar perfil en Firestore
    return this.userProfileService.saveUserProfile(updatedProfile).pipe(
      map(() => {
        const updatedUser: Usuario = {
          ...currentUser,
          ...profileData,
          id: currentUser.id,
          fechaRegistro: currentUser.fechaRegistro
        };
        this.setCurrentUser(updatedUser);
        return updatedUser;
      })
    );
  }


}