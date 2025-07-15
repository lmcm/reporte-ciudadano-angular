import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { Comentario, ComentarioCreate } from '../models/comentario.model';

@Injectable({
  providedIn: 'root'
})
export class ComentariosService {
  private readonly COLLECTION_NAME = 'comentarios';
  private firebaseService = inject(FirebaseService);
  private db = this.firebaseService.getFirestore();

  crearComentario(comentario: ComentarioCreate): Observable<string> {
    const comentarioData = {
      ...comentario,
      fechaCreacion: new Date(),
      activo: true
    };

    return from(addDoc(collection(this.db, this.COLLECTION_NAME), comentarioData))
      .pipe(
        map(docRef => docRef.id),
        catchError(error => throwError(() => this.firebaseService.handleFirebaseError(error)))
      );
  }

  obtenerComentariosPorReporte(reporteId: string): Observable<Comentario[]> {
    const q = query(
      collection(this.db, this.COLLECTION_NAME),
      where('reporteId', '==', reporteId)
    );

    return from(getDocs(q))
      .pipe(
        map(querySnapshot => {
          const comentarios: Comentario[] = [];
          querySnapshot.forEach(doc => {
            comentarios.push({ id: doc.id, ...doc.data() } as Comentario);
          });
          return comentarios.sort((a, b) => {
            const dateA = a.fechaCreacion instanceof Date ? a.fechaCreacion : new Date(a.fechaCreacion as any);
            const dateB = b.fechaCreacion instanceof Date ? b.fechaCreacion : new Date(b.fechaCreacion as any);
            return dateA.getTime() - dateB.getTime();
          });
        }),
        catchError(error => throwError(() => this.firebaseService.handleFirebaseError(error)))
      );
  }
}