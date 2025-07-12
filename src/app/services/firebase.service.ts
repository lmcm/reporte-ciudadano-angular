import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private logger = inject(LoggerService);

  constructor() {
    this.logger.info('FirebaseService inicializado');
  }

  getFirestore() {
    return this.firestore;
  }

  getStorage() {
    return this.storage;
  }

  handleFirebaseError(error: any): string {
    this.logger.error('Firebase Error', { error });
    
    switch (error.code) {
      case 'permission-denied':
        return 'No tienes permisos para realizar esta operación';
      case 'not-found':
        return 'El documento solicitado no existe';
      case 'already-exists':
        return 'El documento ya existe';
      case 'failed-precondition':
        return 'La operación falló debido a condiciones previas';
      case 'aborted':
        return 'La operación fue cancelada';
      case 'out-of-range':
        return 'Los datos están fuera del rango permitido';
      case 'unimplemented':
        return 'Esta operación no está implementada';
      case 'internal':
        return 'Error interno del servidor';
      case 'unavailable':
        return 'El servicio no está disponible temporalmente';
      case 'data-loss':
        return 'Se perdieron datos durante la operación';
      default:
        return 'Ha ocurrido un error inesperado';
    }
  }
}