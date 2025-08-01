import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { ReportesService } from '../../services/reportes.service';
import { TwilioWhatsappService } from '../../services/twilio-whatsapp.service';
import { TipoServicio, EstadoReporte, PrioridadReporte } from '../../models/reporte.model';

@Component({
  selector: 'app-nuevo-reporte-invitado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './nuevo-reporte-invitado.component.html',
  styleUrls: ['./nuevo-reporte-invitado.component.css']
})
export class NuevoReporteInvitadoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private reportesService = inject(ReportesService);
  private twilioWhatsappService = inject(TwilioWhatsappService);

  showMobileMenu = false;
  reporteForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

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
        ciudadanoTelefono: formData.telefono
      };

      this.reportesService.crearReporte(reporteData).subscribe({
        next: (reporteId) => {
          this.successMessage = 'Reporte enviado exitosamente. ID: ' + reporteId;
          
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
}