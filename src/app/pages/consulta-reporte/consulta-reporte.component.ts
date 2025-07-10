import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consulta-reporte',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './consulta-reporte.component.html',

  styles: []
})
export class ConsultaReporteComponent {
  folio = '';
  reporteEncontrado = false;
  folioConsultado = false;
  
  reporte = {
    estado: 'En Progreso',
    fecha: '15 de Julio, 2024',
    tipo: 'Reparación de Bache',
    comentarios: 'El problema ha sido asignado al equipo de mantenimiento y está programado para ser reparado en las próximas 48 horas.'
  };

  buscarReporte() {
    this.folioConsultado = true;
    // Simulación de búsqueda
    if (this.folio.trim()) {
      this.reporteEncontrado = true;
    } else {
      this.reporteEncontrado = false;
    }
  }
}