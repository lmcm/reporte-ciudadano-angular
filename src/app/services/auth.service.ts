import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  fechaRegistro: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private users: Usuario[] = [];

  constructor() {
    this.loadUsersFromStorage();
    this.checkActiveSession();
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
    if (this.users.find(u => u.email === data.email)) {
      return throwError(() => new Error('El email ya está registrado'));
    }

    const newUser: Usuario = {
      id: this.generateId(),
      nombre: data.nombre,
      email: data.email,
      fechaRegistro: new Date()
    };

    this.users.push(newUser);
    this.saveUsersToStorage();
    this.setCurrentUser(newUser);
    this.saveActiveSession(newUser);

    return of(newUser).pipe(delay(500));
  }

  login(credentials: LoginCredentials): Observable<Usuario> {
    const user = this.users.find(u => u.email === credentials.email);
    
    if (!user) {
      return throwError(() => new Error('Usuario no encontrado'));
    }

    if (credentials.password.length < 6) {
      return throwError(() => new Error('Contraseña incorrecta'));
    }

    this.setCurrentUser(user);
    this.saveActiveSession(user);

    return of(user).pipe(delay(500));
  }

  logout(): void {
    this.setCurrentUser(null);
    localStorage.removeItem('activeUser');
  }

  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private loadUsersFromStorage(): void {
    const stored = localStorage.getItem('registeredUsers');
    if (stored) {
      this.users = JSON.parse(stored);
    }
  }

  private saveUsersToStorage(): void {
    localStorage.setItem('registeredUsers', JSON.stringify(this.users));
  }

  private saveActiveSession(user: Usuario): void {
    localStorage.setItem('activeUser', JSON.stringify(user));
  }

  private checkActiveSession(): void {
    const stored = localStorage.getItem('activeUser');
    if (stored) {
      const user = JSON.parse(stored);
      this.setCurrentUser(user);
    }
  }
}