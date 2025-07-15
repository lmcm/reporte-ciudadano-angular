import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ReportesService } from '../../services/reportes.service';
import { AuthService } from '../../services/auth.service';
import { Reporte, EstadoReporte, TipoServicio } from '../../models/reporte.model';

@Component({
  selector: 'app-mis-reportes',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './mis-reportes.component.html',
  styles: []
})
export class MisReportesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private reportesService = inject(ReportesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  reportes: Reporte[] = [];
  loading = true;
  error: string | null = null;
  currentUser = this.authService.getCurrentUser();

  ngOnInit() {
    this.cargarMisReportes();
    this.escucharCambiosEnTiempoReal();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarMisReportes() {
    const userEmail = this.authService.getCurrentUserEmail();
    
    if (!userEmail) {
      this.error = 'Usuario no autenticado';
      this.loading = false;
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    this.reportesService.obtenerReportes(
      { ciudadanoEmail: userEmail },
      { pageSize: 50 }
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        this.reportes = result.reportes;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los reportes: ' + error;
        this.loading = false;
      }
    });
  }

  verDetalle(reporteId: string) {
    this.router.navigate(['/reporte-detalle', reporteId]);
  }

  getStatusClass(estado: EstadoReporte): string {
    switch (estado) {
      case EstadoReporte.COMPLETADO:
        return 'bg-green-100 text-green-800';
      case EstadoReporte.EN_PROGRESO:
        return 'bg-yellow-100 text-yellow-800';
      case EstadoReporte.PENDIENTE:
        return 'bg-red-100 text-red-800';
      case EstadoReporte.CANCELADO:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  formatearFecha(fecha: any): string {
    if (!fecha) return 'Sin fecha';
    
    let date: Date;
    if (fecha.toDate) {
      // Timestamp de Firebase
      date = fecha.toDate();
    } else if (fecha instanceof Date) {
      date = fecha;
    } else {
      date = new Date(fecha);
    }
    
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  recargarReportes() {
    this.cargarMisReportes();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private escucharCambiosEnTiempoReal() {
    const userEmail = this.authService.getCurrentUserEmail();
    
    if (!userEmail) return;
    
    this.reportesService.escucharReportes({ ciudadanoEmail: userEmail })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reportes) => {
          // Solo actualizar si no estamos en estado de carga inicial
          if (!this.loading) {
            this.reportes = reportes;
          }
        },
        error: (error) => {
          console.error('Error en escucha tiempo real:', error);
        }
      });
  }
}