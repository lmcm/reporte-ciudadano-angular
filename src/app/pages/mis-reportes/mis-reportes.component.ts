import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-reportes',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './mis-reportes.component.html',

  styles: []
})
export class MisReportesComponent {
  reportes = [
    { id: '#12345', fecha: '2023-08-15', estado: 'Completado' },
    { id: '#67890', fecha: '2023-07-22', estado: 'En Progreso' },
    { id: '#11223', fecha: '2023-06-10', estado: 'Completado' },
    { id: '#44556', fecha: '2023-05-05', estado: 'Pendiente' },
    { id: '#77889', fecha: '2023-04-18', estado: 'Completado' }
  ];

  getStatusClass(estado: string): string {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'En Progreso':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}