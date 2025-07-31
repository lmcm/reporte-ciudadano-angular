import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReportesService } from '../../services/reportes.service';
import { Reporte, EstadoReporte, TipoServicio } from '../../models/reporte.model';

@Component({
  selector: 'app-consulta-reporte',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './consulta-reporte.component.html',
  styles: []
})
export class ConsultaReporteComponent {
  private reportesService = inject(ReportesService);
  
  showMobileMenu = false;
  folio = '';
  telefono = '';
  reporteEncontrado = false;
  folioConsultado = false;
  loading = false;
  reporte: Reporte | null = null;

  buscarReporte() {
    if (!this.folio.trim() || !this.telefono.trim()) return;
    
    this.loading = true;
    this.folioConsultado = true;
    this.reporteEncontrado = false;
    
    this.reportesService.obtenerTodosLosReportes().subscribe({
      next: (reportes) => {
        const reporteEncontrado = reportes.find(r => 
          r.folio === this.folio.trim() && 
          r.ciudadanoTelefono === this.telefono.trim()
        );
        if (reporteEncontrado) {
          this.reporte = reporteEncontrado;
          this.reporteEncontrado = true;
        } else {
          this.reporte = null;
          this.reporteEncontrado = false;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.reporteEncontrado = false;
        this.reporte = null;
      }
    });
  }

  getStatusText(estado: EstadoReporte): string {
    switch (estado) {
      case EstadoReporte.PENDIENTE: return 'Pendiente';
      case EstadoReporte.EN_PROGRESO: return 'En Progreso';
      case EstadoReporte.COMPLETADO: return 'Completado';
      case EstadoReporte.CANCELADO: return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  getTipoServicioText(tipo: TipoServicio): string {
    switch (tipo) {
      case TipoServicio.LAMPARA: return 'Reparación de luminaria';
      case TipoServicio.BACHE: return 'Reparación de baches';
      case TipoServicio.FUGA_AGUA: return 'Fuga de agua';
      case TipoServicio.BASURA: return 'Recolección de basura';
      case TipoServicio.OTRO: return 'Otro';
      default: return 'Desconocido';
    }
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
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
}