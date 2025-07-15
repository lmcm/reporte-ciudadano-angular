import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ReportesService } from '../../services/reportes.service';
import { ComentariosService } from '../../services/comentarios.service';
import { AuthService } from '../../services/auth.service';
import { Reporte, EstadoReporte, TipoServicio } from '../../models/reporte.model';
import { Comentario, ComentarioCreate, TipoAutor } from '../../models/comentario.model';

@Component({
  selector: 'app-reporte-detalle',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './reporte-detalle.component.html',
  styles: []
})
export class ReporteDetalleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private reportesService = inject(ReportesService);
  private comentariosService = inject(ComentariosService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  reporteId = '';
  reporte: Reporte | null = null;
  comentarios: Comentario[] = [];
  loading = true;
  loadingComentarios = false;
  error: string | null = null;
  nuevoComentario = '';
  enviandoComentario = false;
  areaAsignada = '';
  actualizandoEstado = false;
  actualizandoArea = false;

  ngOnInit() {
    this.reporteId = this.route.snapshot.paramMap.get('id') || '';
    if (this.reporteId) {
      this.cargarReporte();
      this.cargarComentarios();
    } else {
      this.error = 'ID de reporte no válido';
      this.loading = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarReporte() {
    this.loading = true;
    this.error = null;
    
    this.reportesService.obtenerReporte(this.reporteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reporte) => {
          if (reporte) {
            this.reporte = reporte;
            this.areaAsignada = reporte.personalAsignado || '';
          } else {
            this.error = 'Reporte no encontrado';
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar el reporte: ' + error;
          this.loading = false;
        }
      });
  }

  private cargarComentarios() {
    this.loadingComentarios = true;
    
    this.comentariosService.obtenerComentariosPorReporte(this.reporteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comentarios) => {
          this.comentarios = comentarios;
          this.loadingComentarios = false;
        },
        error: (error) => {
          console.error('Error al cargar comentarios:', error);
          this.comentarios = [];
          this.loadingComentarios = false;
        }
      });
  }

  getTipoServicioText(tipo: TipoServicio): string {
    switch (tipo) {
      case TipoServicio.LAMPARA:
        return 'Lámpara';
      case TipoServicio.BACHE:
        return 'Bache';
      case TipoServicio.FUGA_AGUA:
        return 'Fuga de Agua';
      case TipoServicio.BASURA:
        return 'Basura';
      case TipoServicio.OTRO:
        return 'Otro';
      default:
        return 'Desconocido';
    }
  }

  getStatusText(estado: EstadoReporte): string {
    switch (estado) {
      case EstadoReporte.COMPLETADO:
        return 'Completado';
      case EstadoReporte.EN_PROGRESO:
        return 'En Progreso';
      case EstadoReporte.PENDIENTE:
        return 'Pendiente';
      case EstadoReporte.CANCELADO:
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return 'Sin fecha';
    
    let date: Date;
    if (fecha.toDate) {
      date = fecha.toDate();
    } else if (fecha instanceof Date) {
      date = fecha;
    } else {
      date = new Date(fecha);
    }
    
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  volver() {
    this.router.navigate(['/mis-reportes']);
  }

  enviarComentario() {
    if (!this.nuevoComentario.trim() || this.enviandoComentario) return;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.reporte) return;
    
    this.enviandoComentario = true;
    
    // Determinar tipo de autor
    const esCreadorDelReporte = currentUser.email === this.reporte.ciudadanoEmail;
    const tipoAutor = esCreadorDelReporte ? TipoAutor.CIUDADANO : TipoAutor.AYUNTAMIENTO;
    
    const comentarioData: ComentarioCreate = {
      reporteId: this.reporteId,
      autorId: currentUser.id,
      autorNombre: currentUser.nombre + ' ' + currentUser.apellidos,
      autorEmail: currentUser.email,
      autorTipo: tipoAutor,
      texto: this.nuevoComentario.trim()
    };
    
    this.comentariosService.crearComentario(comentarioData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.nuevoComentario = '';
          this.cargarComentarios(); // Recargar comentarios
          this.enviandoComentario = false;
        },
        error: (error) => {
          console.error('Error al enviar comentario:', error);
          this.enviandoComentario = false;
        }
      });
  }
  
  getTipoAutorText(tipo: TipoAutor): string {
    return tipo === TipoAutor.CIUDADANO ? 'Ciudadano' : 'Ayuntamiento';
  }
  
  getTipoAutorClass(tipo: TipoAutor): string {
    return tipo === TipoAutor.CIUDADANO ? 'text-blue-600' : 'text-green-600';
  }
  
  formatearNombreCorto(nombreCompleto: string): string {
    const palabras = nombreCompleto.trim().split(' ');
    if (palabras.length >= 2) {
      const primerNombre = palabras[0].charAt(0).toUpperCase() + palabras[0].slice(1).toLowerCase();
      const primerApellido = palabras[1].charAt(0).toUpperCase() + palabras[1].slice(1).toLowerCase();
      return `${primerNombre} ${primerApellido}`;
    }
    return palabras[0].charAt(0).toUpperCase() + palabras[0].slice(1).toLowerCase();
  }

  guardarCambios() {
    if (!this.reporte || this.actualizandoEstado || this.actualizandoArea) return;
    
    this.actualizandoEstado = true;
    this.actualizandoArea = true;
    
    const updates = {
      estado: this.reporte.estado,
      personalAsignado: this.areaAsignada
    };
    
    this.reportesService.actualizarReporte(this.reporteId, updates)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Cambios guardados correctamente');
          this.actualizandoEstado = false;
          this.actualizandoArea = false;
        },
        error: (error) => {
          console.error('Error al guardar cambios:', error);
          this.actualizandoEstado = false;
          this.actualizandoArea = false;
        }
      });
  }
}