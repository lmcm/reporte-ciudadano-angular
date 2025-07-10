import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './admin-panel.component.html',
  styles: []
})
export class AdminPanelComponent {
  reportes = [
    { id: 1, folio: '#20240001', tipo: 'Reparación de luminaria', estado: 'En Progreso', fecha: '2024-01-15' },
    { id: 2, folio: '#20240002', tipo: 'Fuga de agua', estado: 'Completado', fecha: '2024-01-16' },
    { id: 3, folio: '#20240003', tipo: 'Recolección de basura', estado: 'Pendiente', fecha: '2024-01-17' },
    { id: 4, folio: '#20240004', tipo: 'Reparación de baches', estado: 'En Progreso', fecha: '2024-01-18' },
    { id: 5, folio: '#20240005', tipo: 'Reparación de luminaria', estado: 'Completado', fecha: '2024-01-19' },
    { id: 6, folio: '#20240006', tipo: 'Fuga de agua', estado: 'Pendiente', fecha: '2024-01-20' },
    { id: 7, folio: '#20240007', tipo: 'Recolección de basura', estado: 'En Progreso', fecha: '2024-01-21' },
    { id: 8, folio: '#20240008', tipo: 'Reparación de baches', estado: 'Completado', fecha: '2024-01-22' }
  ];

  getStatusClass(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'En Progreso':
        return 'bg-blue-100 text-blue-800';
      case 'Completado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  verDetalle(id: number) {
    console.log('Ver detalle del reporte:', id);
  }
}