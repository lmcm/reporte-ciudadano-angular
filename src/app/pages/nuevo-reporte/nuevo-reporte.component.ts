import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nuevo-reporte',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './nuevo-reporte.component.html',

  styles: []
})
export class NuevoReporteComponent {
  reporte = {
    tipoServicio: '',
    direccion: '',
    comentarios: ''
  };

  onSubmit() {
    console.log('Nuevo reporte:', this.reporte);
  }
}