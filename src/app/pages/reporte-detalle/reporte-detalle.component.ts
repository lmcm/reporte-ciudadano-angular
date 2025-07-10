import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reporte-detalle',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './reporte-detalle.component.html',

  styles: []
})
export class ReporteDetalleComponent implements OnInit {
  reporteId = '';
  nuevoComentario = '';
  
  reporte = {
    fecha: '18-05-2024',
    tipo: 'Reparación de Bache',
    ubicacion: 'Av. Independencia 123, Centro, Boca del Río, Ver.',
    descripcion: 'Bache grande en medio de la calle, causando problemas de tráfico y daños potenciales a los vehículos.',
    estado: 'En Progreso',
    personalAsignado: 'Equipo de Obras Públicas A'
  };

  historial = [
    { estado: 'Completado', fecha: '22 de Mayo, 2024' },
    { estado: 'En Progreso', fecha: '19 de Mayo, 2024' },
    { estado: 'Recibido', fecha: '18 de Mayo, 2024' }
  ];

  comentarios = [
    {
      autor: 'Juan Pérez (Ciudadano)',
      fecha: '20 de Mayo, 2024',
      texto: 'Gracias por la rápida respuesta. ¿Hay alguna estimación de cuándo podría estar resuelto?',
      avatar: 'https://lh3.googleusercontent.com/a-/ACNPEu_RmyC1Q5B-orP1AATv_ip-2I80-4LwBty-vjQj=s96-c'
    },
    {
      autor: 'Ana García (Ayuntamiento)',
      fecha: '21 de Mayo, 2024',
      texto: 'Hola Juan, el equipo ya está trabajando en ello. Esperamos que quede resuelto en las próximas 24-48 horas. Gracias por su paciencia.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvh128m3DzLuKW4KCOM62eraXokcfuAyF6uulYQGryNaAo5u4y-x9OypSGClwOMEVLGfgDI-T0WLEhZxZhU9ZE_AcWyaiYM64L6K60Q-FbsdGvu6ANblwwLnX74wHsoEH3jKme7EKfYKQU9GEVxPrwcI-WDPa_SM5B4jNXavYgpoRXUuPSPNrA3AwbyZcjZjVCAgLUYg-T48-rwM9mqlrz4fUthbsf48LcA7N7I_2CtChqSGREXmUPjAbWoowJTvwa5t3_PcfTDcD8'
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.reporteId = this.route.snapshot.paramMap.get('id') || '12345';
  }

  guardarCambios() {
    console.log('Guardando cambios:', this.reporte);
  }

  enviarComentario() {
    if (this.nuevoComentario.trim()) {
      const nuevoComentarioObj = {
        autor: 'Usuario Actual (Ayuntamiento)',
        fecha: new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        texto: this.nuevoComentario,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvh128m3DzLuKW4KCOM62eraXokcfuAyF6uulYQGryNaAo5u4y-x9OypSGClwOMEVLGfgDI-T0WLEhZxZhU9ZE_AcWyaiYM64L6K60Q-FbsdGvu6ANblwwLnX74wHsoEH3jKme7EKfYKQU9GEVxPrwcI-WDPa_SM5B4jNXavYgpoRXUuPSPNrA3AwbyZcjZjVCAgLUYg-T48-rwM9mqlrz4fUthbsf48LcA7N7I_2CtChqSGREXmUPjAbWoowJTvwa5t3_PcfTDcD8'
      };
      
      this.comentarios.push(nuevoComentarioObj);
      this.nuevoComentario = '';
    }
  }
}