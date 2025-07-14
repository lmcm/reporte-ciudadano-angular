import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { LoggerService } from './logger.service';
import { Reporte, ReporteCreate, ReporteUpdate, EstadoReporte, PrioridadReporte, TipoServicio } from '../models/reporte.model';

export interface ReporteFilter {
  estado?: EstadoReporte;
  prioridad?: PrioridadReporte;
  tipoServicio?: TipoServicio;
  ciudadanoId?: string;
  ciudadanoEmail?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface PaginationOptions {
  pageSize: number;
  lastDoc?: DocumentSnapshot;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private readonly COLLECTION_NAME = 'reportes';
  private firebaseService = inject(FirebaseService);
  private logger = inject(LoggerService);
  private db = this.firebaseService.getFirestore();
  private reportesSubject = new BehaviorSubject<Reporte[]>([]);
  public reportes$ = this.reportesSubject.asObservable();

  constructor() {
    this.logger.info('ReportesService inicializado');
  }

  // Crear nuevo reporte
  crearReporte(reporte: ReporteCreate): Observable<string> {
    this.logger.info('Creando nuevo reporte', { 
      tipoServicio: reporte.tipoServicio, 
      ciudadanoId: reporte.ciudadanoId 
    });
    
    const reporteData = {
      ...reporte,
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
      activo: true
    };

    return from(addDoc(collection(this.db, this.COLLECTION_NAME), reporteData))
      .pipe(
        map(docRef => {
          this.logger.info('Reporte creado exitosamente', { reporteId: docRef.id });
          return docRef.id;
        }),
        catchError(error => {
          this.logger.error('Error al crear reporte', { error, reporteData });
          return throwError(() => this.firebaseService.handleFirebaseError(error));
        })
      );
  }

  // Obtener reporte por ID
  obtenerReporte(id: string): Observable<Reporte | null> {
    this.logger.debug('Obteniendo reporte por ID', { reporteId: id });
    const docRef = doc(this.db, this.COLLECTION_NAME, id);
    
    return from(getDoc(docRef))
      .pipe(
        map(docSnap => {
          if (docSnap.exists()) {
            const reporte = { id: docSnap.id, ...docSnap.data() } as Reporte;
            this.logger.debug('Reporte encontrado', { reporteId: id });
            return reporte;
          }
          this.logger.warn('Reporte no encontrado', { reporteId: id });
          return null;
        }),
        catchError(error => {
          this.logger.error('Error al obtener reporte', { error, reporteId: id });
          return throwError(() => this.firebaseService.handleFirebaseError(error));
        })
      );
  }

  // Actualizar reporte
  actualizarReporte(id: string, updates: ReporteUpdate): Observable<void> {
    this.logger.info('Actualizando reporte', { reporteId: id, updates });
    const docRef = doc(this.db, this.COLLECTION_NAME, id);
    const updateData = {
      ...updates,
      fechaActualizacion: serverTimestamp()
    };

    return from(updateDoc(docRef, updateData))
      .pipe(
        tap(() => this.logger.info('Reporte actualizado exitosamente', { reporteId: id })),
        catchError(error => {
          this.logger.error('Error al actualizar reporte', { error, reporteId: id, updates });
          return throwError(() => this.firebaseService.handleFirebaseError(error));
        })
      );
  }

  // Eliminar reporte (soft delete)
  eliminarReporte(id: string): Observable<void> {
    this.logger.info('Eliminando reporte (soft delete)', { reporteId: id });
    const docRef = doc(this.db, this.COLLECTION_NAME, id);
    
    return from(updateDoc(docRef, { 
      activo: false, 
      fechaActualizacion: serverTimestamp() 
    }))
      .pipe(
        tap(() => this.logger.info('Reporte eliminado exitosamente', { reporteId: id })),
        catchError(error => {
          this.logger.error('Error al eliminar reporte', { error, reporteId: id });
          return throwError(() => this.firebaseService.handleFirebaseError(error));
        })
      );
  }

  // Obtener reportes con filtros y paginación
  obtenerReportes(
    filtros?: ReporteFilter, 
    paginacion?: PaginationOptions
  ): Observable<{ reportes: Reporte[], lastDoc?: DocumentSnapshot }> {
    this.logger.debug('Obteniendo reportes con filtros', { filtros, paginacion });
    
    const constraints: QueryConstraint[] = [];

    // Para consultas de usuario específico, usar ciudadanoId o ciudadanoEmail sin orderBy para evitar índice compuesto
    if (filtros?.ciudadanoId) {
      constraints.push(where('ciudadanoId', '==', filtros.ciudadanoId));
      constraints.push(where('activo', '==', true));
    } else if (filtros?.ciudadanoEmail) {
      constraints.push(where('ciudadanoEmail', '==', filtros.ciudadanoEmail));
      constraints.push(where('activo', '==', true));
    } else {
      // Para consultas generales, usar solo activo y orderBy
      constraints.push(where('activo', '==', true));
      constraints.push(orderBy('fechaCreacion', 'desc'));
    }

    // Aplicar otros filtros solo si no hay ciudadanoId ni ciudadanoEmail
    if (filtros && !filtros.ciudadanoId && !filtros.ciudadanoEmail) {
      if (filtros.estado) {
        constraints.push(where('estado', '==', filtros.estado));
      }
      if (filtros.prioridad) {
        constraints.push(where('prioridad', '==', filtros.prioridad));
      }
      if (filtros.tipoServicio) {
        constraints.push(where('tipoServicio', '==', filtros.tipoServicio));
      }
    }

    // Aplicar paginación
    if (paginacion) {
      if (paginacion.lastDoc) {
        constraints.push(startAfter(paginacion.lastDoc));
      }
      constraints.push(limit(paginacion.pageSize));
    }

    const q = query(collection(this.db, this.COLLECTION_NAME), ...constraints);

    return from(getDocs(q))
      .pipe(
        map(querySnapshot => {
          let reportes: Reporte[] = [];
          let lastDoc: DocumentSnapshot | undefined;

          querySnapshot.forEach(doc => {
            reportes.push({ id: doc.id, ...doc.data() } as Reporte);
            lastDoc = doc;
          });

          // Si hay ciudadanoId o ciudadanoEmail, ordenar manualmente por fecha
          if (filtros?.ciudadanoId || filtros?.ciudadanoEmail) {
            reportes = reportes.sort((a, b) => {
              const fechaA = a.fechaCreacion instanceof Timestamp ? a.fechaCreacion.toDate() : new Date(a.fechaCreacion);
              const fechaB = b.fechaCreacion instanceof Timestamp ? b.fechaCreacion.toDate() : new Date(b.fechaCreacion);
              return fechaB.getTime() - fechaA.getTime();
            });
          }

          this.logger.debug('Reportes obtenidos', { count: reportes.length });
          return { reportes, lastDoc };
        }),
        catchError(error => {
          this.logger.error('Error al obtener reportes', { error, filtros, paginacion });
          return throwError(() => this.firebaseService.handleFirebaseError(error));
        })
      );
  }

  // Escuchar cambios en tiempo real
  escucharReportes(filtros?: ReporteFilter): Observable<Reporte[]> {
    this.logger.info('Iniciando escucha en tiempo real de reportes', { filtros });
    
    const constraints: QueryConstraint[] = [];

    // Para consultas de usuario específico, evitar orderBy para prevenir índice compuesto
    if (filtros?.ciudadanoId) {
      constraints.push(where('ciudadanoId', '==', filtros.ciudadanoId));
      constraints.push(where('activo', '==', true));
    } else if (filtros?.ciudadanoEmail) {
      constraints.push(where('ciudadanoEmail', '==', filtros.ciudadanoEmail));
      constraints.push(where('activo', '==', true));
    } else {
      constraints.push(where('activo', '==', true));
      constraints.push(orderBy('fechaCreacion', 'desc'));
    }

    // Aplicar otros filtros solo si no hay ciudadanoId ni ciudadanoEmail
    if (filtros && !filtros.ciudadanoId && !filtros.ciudadanoEmail) {
      if (filtros.estado) {
        constraints.push(where('estado', '==', filtros.estado));
      }
    }

    const q = query(collection(this.db, this.COLLECTION_NAME), ...constraints);

    return new Observable<Reporte[]>(observer => {
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          let reportes: Reporte[] = [];
          querySnapshot.forEach(doc => {
            reportes.push({ id: doc.id, ...doc.data() } as Reporte);
          });
          
          // Si hay ciudadanoId o ciudadanoEmail, ordenar manualmente por fecha
          if (filtros?.ciudadanoId || filtros?.ciudadanoEmail) {
            reportes = reportes.sort((a, b) => {
              const fechaA = a.fechaCreacion instanceof Timestamp ? a.fechaCreacion.toDate() : new Date(a.fechaCreacion);
              const fechaB = b.fechaCreacion instanceof Timestamp ? b.fechaCreacion.toDate() : new Date(b.fechaCreacion);
              return fechaB.getTime() - fechaA.getTime();
            });
          }
          
          this.reportesSubject.next(reportes);
          observer.next(reportes);
          this.logger.debug('Reportes actualizados en tiempo real', { count: reportes.length });
        },
        (error) => {
          this.logger.error('Error en escucha tiempo real', { error });
          observer.error(this.firebaseService.handleFirebaseError(error));
        }
      );

      return () => {
        this.logger.info('Desconectando escucha en tiempo real');
        unsubscribe();
      };
    });
  }

  // Cambiar estado del reporte
  cambiarEstado(id: string, nuevoEstado: EstadoReporte): Observable<void> {
    this.logger.info('Cambiando estado de reporte', { reporteId: id, nuevoEstado });
    return this.actualizarReporte(id, { estado: nuevoEstado });
  }

  // Asignar personal
  asignarPersonal(id: string, personalId: string): Observable<void> {
    this.logger.info('Asignando personal a reporte', { reporteId: id, personalId });
    return this.actualizarReporte(id, { 
      personalAsignado: personalId,
      estado: EstadoReporte.EN_PROGRESO 
    });
  }

  // Obtener estadísticas
  obtenerEstadisticas(): Observable<any> {
    this.logger.debug('Obteniendo estadísticas de reportes');
    
    return from(getDocs(collection(this.db, this.COLLECTION_NAME)))
      .pipe(
        map(querySnapshot => {
          const stats = {
            total: 0,
            porEstado: {} as Record<EstadoReporte, number>,
            porPrioridad: {} as Record<PrioridadReporte, number>,
            porTipo: {} as Record<TipoServicio, number>
          };

          querySnapshot.forEach(doc => {
            const reporte = doc.data() as Reporte;
            if (reporte.activo) {
              stats.total++;
              stats.porEstado[reporte.estado] = (stats.porEstado[reporte.estado] || 0) + 1;
              stats.porPrioridad[reporte.prioridad] = (stats.porPrioridad[reporte.prioridad] || 0) + 1;
              stats.porTipo[reporte.tipoServicio] = (stats.porTipo[reporte.tipoServicio] || 0) + 1;
            }
          });

          this.logger.info('Estadísticas calculadas', stats);
          return stats;
        }),
        catchError(error => {
          this.logger.error('Error al obtener estadísticas', { error });
          return throwError(() => this.firebaseService.handleFirebaseError(error));
        })
      );
  }
}