import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ReportesService } from '../../services/reportes.service';
import { Reporte, EstadoReporte, TipoServicio } from '../../models/reporte.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './admin-panel.component.html',
  styles: []
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private reportesService = inject(ReportesService);
  private router = inject(Router);
  
  reportes: Reporte[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.cargarReportes();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarReportes() {
    this.loading = true;
    this.error = null;
    
    this.reportesService.obtenerTodosLosReportes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reportes) => {
          this.reportes = reportes.sort((a, b) => {
            const dateA = a.fechaCreacion instanceof Date ? a.fechaCreacion : new Date(a.fechaCreacion as any);
            const dateB = b.fechaCreacion instanceof Date ? b.fechaCreacion : new Date(b.fechaCreacion as any);
            return dateB.getTime() - dateA.getTime(); // Más reciente primero
          });
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar reportes: ' + error;
          this.loading = false;
        }
      });
  }

  getStatusClass(estado: EstadoReporte): string {
    switch (estado) {
      case EstadoReporte.PENDIENTE:
        return 'bg-yellow-100 text-yellow-800';
      case EstadoReporte.EN_PROGRESO:
        return 'bg-blue-100 text-blue-800';
      case EstadoReporte.COMPLETADO:
        return 'bg-green-100 text-green-800';
      case EstadoReporte.CANCELADO:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(estado: EstadoReporte): string {
    switch (estado) {
      case EstadoReporte.PENDIENTE:
        return 'Pendiente';
      case EstadoReporte.EN_PROGRESO:
        return 'En Progreso';
      case EstadoReporte.COMPLETADO:
        return 'Completado';
      case EstadoReporte.CANCELADO:
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }

  getTipoServicioText(tipo: TipoServicio): string {
    switch (tipo) {
      case TipoServicio.LAMPARA:
        return 'Reparación de luminaria';
      case TipoServicio.BACHE:
        return 'Reparación de baches';
      case TipoServicio.FUGA_AGUA:
        return 'Fuga de agua';
      case TipoServicio.BASURA:
        return 'Recolección de basura';
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
      date = fecha.toDate();
    } else if (fecha instanceof Date) {
      date = fecha;
    } else {
      date = new Date(fecha);
    }
    
    return date.toLocaleDateString('es-MX');
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

  verDetalle(reporteId: string) {
    this.router.navigate(['/reporte-detalle', reporteId]);
  }
}