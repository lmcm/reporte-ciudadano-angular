import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { ReportesService } from '../../services/reportes.service';
import { TwilioWhatsappService } from '../../services/twilio-whatsapp.service';
import { TipoServicio, EstadoReporte, PrioridadReporte } from '../../models/reporte.model';

declare var L: any;

@Component({
  selector: 'app-nuevo-reporte-invitado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './nuevo-reporte-invitado.component.html',
  styleUrls: ['./nuevo-reporte-invitado.component.css']
})
export class NuevoReporteInvitadoComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private reportesService = inject(ReportesService);
  private twilioWhatsappService = inject(TwilioWhatsappService);

  showMobileMenu = false;
  reporteForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  private map: any;
  private marker: any;
  selectedLocation: {lat: number, lng: number} | null = null;

  tiposServicio = [
    { value: TipoServicio.LAMPARA, label: 'Reparación de luminaria' },
    { value: TipoServicio.BACHE, label: 'Reparación de baches' },
    { value: TipoServicio.FUGA_AGUA, label: 'Fuga de agua' },
    { value: TipoServicio.BASURA, label: 'Recolección de basura' },
    { value: TipoServicio.OTRO, label: 'Otro' }
  ];

  ngOnInit() {
    this.initializeForm();
  }

  ngAfterViewInit() {
    this.loadLeaflet();
  }

  private initializeForm() {
    this.reporteForm = this.fb.group({
      tipoServicio: ['', [Validators.required]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      direccion: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200)
      ]],
      comentarios: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]]
    });
  }

  hasError(field: string): boolean {
    const control = this.reporteForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.reporteForm.get(field);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    switch (field) {
      case 'tipoServicio':
        if (errors['required']) return 'Seleccione un tipo de servicio';
        break;
      case 'telefono':
        if (errors['required']) return 'El teléfono es requerido';
        if (errors['pattern']) return 'Ingrese un teléfono válido de 10 dígitos';
        if (errors['minlength'] || errors['maxlength']) return 'El teléfono debe tener exactamente 10 dígitos';
        break;
      case 'direccion':
        if (errors['required']) return 'La dirección es requerida';
        if (errors['minlength']) return 'La dirección debe tener al menos 10 caracteres';
        if (errors['maxlength']) return 'La dirección no puede exceder 200 caracteres';
        break;
      case 'comentarios':
        if (errors['required']) return 'Los comentarios son requeridos';
        if (errors['minlength']) return 'Los comentarios deben tener al menos 10 caracteres';
        if (errors['maxlength']) return 'Los comentarios no pueden exceder 500 caracteres';
        break;
    }

    return 'Campo inválido';
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  onSubmit() {
    if (this.reporteForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.reporteForm.value;
      
      const reporteData = {
        tipoServicio: formData.tipoServicio,
        direccion: formData.direccion,
        comentarios: formData.comentarios,
        estado: EstadoReporte.PENDIENTE, // Estado inicial para historial
        prioridad: PrioridadReporte.MEDIA,
        ciudadanoId: 'invitado_' + Date.now(),
        ciudadanoNombre: 'Usuario',
        ciudadanoApellidos: 'Anónimo',
        ciudadanoEmail: 'anonimo@invitado.com',
        ciudadanoTelefono: formData.telefono,
        coordenadas: this.selectedLocation ? {
          lat: this.selectedLocation.lat,
          lng: this.selectedLocation.lng
        } : undefined
      };

      this.reportesService.crearReporte(reporteData).subscribe({
        next: (reporteId) => {
          this.successMessage = 'Reporte enviado exitosamente. ID: ' + reporteId;
          
          // Scroll al mensaje de éxito
          setTimeout(() => {
            const successElement = document.querySelector('.success-message');
            if (successElement) {
              successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
          
          // Enviar notificación Twilio WhatsApp
          const telefono = formData.telefono;
          if (telefono) {
            this.twilioWhatsappService.sendReportNotification(telefono, reporteId)
              .subscribe({
                next: () => console.log('Twilio WhatsApp enviado', { reporteId, telefono }),
                error: (error) => console.warn('Error al enviar Twilio WhatsApp', { error, reporteId })
              });
          }
          
          this.reporteForm.reset();
          this.selectedLocation = null;
          if (this.marker) {
            this.map.removeLayer(this.marker);
            this.marker = null;
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Error al enviar el reporte: ' + error;
          this.isLoading = false;
        }
      });
    } else {
      this.reporteForm.markAllAsTouched();
    }
  }

  private loadLeaflet(): void {
    if (typeof L !== 'undefined') {
      this.initMap();
      return;
    }

    // Cargar CSS de Leaflet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Cargar JavaScript de Leaflet
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      this.initMap();
    };
    document.head.appendChild(script);
  }

  private initMap(): void {
    // Coordenadas de Boca del Río, Veracruz
    const bocaDelRio = [19.1127, -96.1147];
    
    this.map = L.map('guestMap').setView(bocaDelRio, 13);
    
    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    // Agregar listener para clics en el mapa
    this.map.on('click', (event: any) => {
      this.onMapClick(event);
    });
  }

  private onMapClick(event: any): void {
    // Remover marcador anterior si existe
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    
    // Crear nuevo marcador
    this.marker = L.marker([event.latlng.lat, event.latlng.lng])
      .addTo(this.map)
      .bindPopup('Obteniendo dirección...')
      .openPopup();
    
    // Guardar coordenadas
    this.selectedLocation = {
      lat: event.latlng.lat,
      lng: event.latlng.lng
    };
    
    // Obtener dirección usando geocodificación inversa
    this.getAddressFromCoordinates(event.latlng.lat, event.latlng.lng);
  }

  private getAddressFromCoordinates(lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data && data.display_name) {
          const address = this.formatAddress(data);
          
          // Actualizar campo de dirección
          this.reporteForm.patchValue({ direccion: address });
          
          // Actualizar popup del marcador
          if (this.marker) {
            this.marker.bindPopup(`Ubicación: ${address}`).openPopup();
          }
        }
      })
      .catch(error => {
        console.error('Error al obtener dirección', error);
        if (this.marker) {
          this.marker.bindPopup('Ubicación seleccionada').openPopup();
        }
      });
  }

  private formatAddress(data: any): string {
    const address = data.address || {};
    const parts = [];
    
    // Agregar número y calle
    if (address.house_number) parts.push(address.house_number);
    if (address.road) parts.push(address.road);
    
    // Agregar colonia/barrio
    if (address.neighbourhood) parts.push(`Col. ${address.neighbourhood}`);
    else if (address.suburb) parts.push(`Col. ${address.suburb}`);
    
    // Agregar ciudad
    if (address.city) parts.push(address.city);
    else if (address.town) parts.push(address.town);
    else if (address.village) parts.push(address.village);
    
    // Agregar estado
    if (address.state) parts.push(address.state);
    
    // Si no hay suficiente información, usar display_name
    if (parts.length < 2) {
      return data.display_name.split(',').slice(0, 3).join(', ');
    }
    
    return parts.join(', ');
  }
}