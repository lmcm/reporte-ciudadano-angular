import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  fechaRegistro: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Simular usuario autenticado - en una implementación real vendría de Firebase Auth
    this.setCurrentUser({
      id: 'user123',
      nombre: 'luis castillo',
      email: 'lmcmluis@gmail.com',
      fechaRegistro: new Date('2022-01-15')
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

  // Método para simular logout
  logout(): void {
    this.setCurrentUser(null);
  }

  // Método para simular login
  login(user: Usuario): void {
    this.setCurrentUser(user);
  }
}