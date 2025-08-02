import { Component, OnDestroy, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ReportesService } from '../../services/reportes.service';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { TwilioWhatsappService } from '../../services/twilio-whatsapp.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { ReporteValidators } from '../../validators/reporte.validators';
import { TipoServicio, PrioridadReporte, EstadoReporte, ReporteCreate } from '../../models/reporte.model';
import { HeaderComponent } from "src/app/components/header/header.component";

@Component({
  selector: 'app-nuevo-reporte',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, HeaderComponent],
  templateUrl: './nuevo-reporte.component.html',
  styles: []
})
export class NuevoReporteComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private reportesService = inject(ReportesService);
  private authService = inject(AuthService);
  private firebaseAuth = inject(FirebaseAuthService);
  private logger = inject(LoggerService);
  private twilioWhatsappService = inject(TwilioWhatsappService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  reporteForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedFile: File | null = null;
  showMobileMenu = false;
  currentUser: any = null;
  redirectCountdown = 0;
  currentReporteId = '';
  private countdownInterval: any = null;

  readonly tiposServicio = [
    { value: TipoServicio.LAMPARA, label: 'Lámpara fundida o averiada' },
    { value: TipoServicio.BACHE, label: 'Bache en la calle' },
    { value: TipoServicio.FUGA_AGUA, label: 'Fuga de agua' },
    { value: TipoServicio.BASURA, label: 'Basura acumulada' },
    { value: TipoServicio.OTRO, label: 'Otro' }
  ];

  constructor() {
    this.reporteForm = this.createForm();
    this.logger.info('NuevoReporteComponent inicializado');
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.logger.info('NuevoReporteComponent destruido');
  }

  private createForm(): FormGroup {
    return this.fb.group({
      tipoServicio: ['', [Validators.required, ReporteValidators.tipoServicio()]],
      direccion: ['', [Validators.required, ReporteValidators.direccion()]],
      comentarios: ['', [ReporteValidators.comentarios()]],
      ciudadanoNombre: ['', [Validators.required, ReporteValidators.nombreCiudadano()]],
      ciudadanoApellidos: ['', [Validators.required, ReporteValidators.apellidos()]],
      ciudadanoEmail: ['', [Validators.required, ReporteValidators.email()]],
      ciudadanoTelefono: ['', [Validators.required, ReporteValidators.telefono()]],
      evidencia: [null, [ReporteValidators.evidenciasFotograficas()]]
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files?.length) {
      this.selectedFile = target.files[0];
      this.reporteForm.patchValue({ evidencia: this.selectedFile });
      this.logger.info('Archivo seleccionado', { fileName: this.selectedFile.name, size: this.selectedFile.size });
    }
  }

  onSubmit(): void {
    if (this.reporteForm.invalid) {
      this.markFormGroupTouched();
      this.logger.warn('Formulario inválido', { errors: this.getFormErrors() });
      return;
    }

    if (this.isLoading) return;

    this.isLoading = true;
    this.clearMessages();
    this.logger.info('Iniciando creación de reporte');

    const reporteData = this.buildReporteData();

    this.reportesService.crearReporte(reporteData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (reporteId) => this.handleSuccess(reporteId),
        error: (error) => this.handleError(error)
      });
  }

  private buildReporteData(): ReporteCreate {
    const formData = this.reporteForm.getRawValue(); // getRawValue incluye campos deshabilitados
    return {
      tipoServicio: formData.tipoServicio,
      direccion: formData.direccion.trim(),
      comentarios: formData.comentarios?.trim() || '',
      ciudadanoId: this.generateTempUserId(),
      ciudadanoNombre: formData.ciudadanoNombre?.trim() || '',
      ciudadanoApellidos: formData.ciudadanoApellidos?.trim() || '',
      ciudadanoEmail: formData.ciudadanoEmail?.trim().toLowerCase() || '',
      ciudadanoTelefono: formData.ciudadanoTelefono?.trim() || '',
      estado: EstadoReporte.PENDIENTE, // Estado inicial para historial
      prioridad: this.calculatePriority(formData.tipoServicio),
      evidenciasFotograficas: this.selectedFile ? [] : undefined
    };
  }

  private calculatePriority(tipoServicio: TipoServicio): PrioridadReporte {
    const priorityMap: Record<TipoServicio, PrioridadReporte> = {
      [TipoServicio.FUGA_AGUA]: PrioridadReporte.ALTA,
      [TipoServicio.BACHE]: PrioridadReporte.MEDIA,
      [TipoServicio.LAMPARA]: PrioridadReporte.BAJA,
      [TipoServicio.BASURA]: PrioridadReporte.MEDIA,
      [TipoServicio.OTRO]: PrioridadReporte.BAJA
    };
    return priorityMap[tipoServicio] || PrioridadReporte.BAJA;
  }

  private handleSuccess(reporteId: string): void {
    this.successMessage = `Reporte creado exitosamente. ID: ${reporteId}`;
    this.currentReporteId = reporteId;
    this.logger.info('Reporte creado exitosamente', { reporteId });
    
    // Scroll al mensaje de éxito
    setTimeout(() => {
      const successElement = document.querySelector('.success-message');
      if (successElement) {
        successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    // Iniciar contador de redirección con delay
    setTimeout(() => {
      this.redirectCountdown = 10;
      this.countdownInterval = setInterval(() => {
        this.redirectCountdown--;
        if (this.redirectCountdown <= 0) {
          clearInterval(this.countdownInterval);
          this.router.navigate(['/mis-reportes']);
        }
      }, 1000);
    }, 2000); // Esperar 2 segundos para que el reporte se guarde completamente
    
    // Enviar notificación Twilio WhatsApp
    const formData = this.reporteForm.getRawValue();
    const telefono = formData.ciudadanoTelefono;
    
    this.logger.info('Intentando enviar WhatsApp', { 
      reporteId, 
      telefono, 
      hasPhone: !!telefono,
      phoneLength: telefono?.length 
    });
    
    if (telefono && telefono.trim()) {
      this.twilioWhatsappService.sendReportNotification(telefono.trim(), reporteId)
        .subscribe({
          next: (response) => {
            this.logger.info('Twilio WhatsApp enviado exitosamente', { 
              reporteId, 
              telefono, 
              response 
            });
          },
          error: (error) => {
            this.logger.error('Error al enviar Twilio WhatsApp', { 
              error: error.message || error, 
              reporteId, 
              telefono 
            });
          }
        });
    } else {
      this.logger.warn('No se pudo enviar WhatsApp: teléfono no disponible', { 
        reporteId, 
        formData: formData 
      });
    }
    
    this.resetForm();
  }

  private handleError(error: string): void {
    this.errorMessage = error;
    this.logger.error('Error al crear reporte', { error });
  }

  private resetForm(): void {
    this.reporteForm.reset();
    this.selectedFile = null;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.reporteForm.controls).forEach(key => {
      this.reporteForm.get(key)?.markAsTouched();
    });
  }

  private getFormErrors(): Record<string, any> {
    const errors: Record<string, any> = {};
    Object.keys(this.reporteForm.controls).forEach(key => {
      const control = this.reporteForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  private loadUserData(): void {
    // Suscribirse a cambios del usuario autenticado
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(currentUser => {
      this.currentUser = currentUser;
      if (currentUser && this.authService.isAuthenticated()) {
        // Precargar información del usuario logueado
        this.reporteForm.patchValue({
          ciudadanoNombre: currentUser.nombre || '',
          ciudadanoApellidos: currentUser.apellidos || '',
          ciudadanoEmail: currentUser.email || '',
          ciudadanoTelefono: currentUser.telefono || ''
        });
        
        // Deshabilitar campos precargados para evitar modificaciones accidentales
        // Teléfono permanece editable
        this.reporteForm.get('ciudadanoNombre')?.disable();
        this.reporteForm.get('ciudadanoApellidos')?.disable();
        this.reporteForm.get('ciudadanoEmail')?.disable();
        this.reporteForm.get('ciudadanoTelefono')?.enable();
        
        this.logger.info('Datos de usuario precargados automáticamente', { 
          userId: currentUser.id,
          nombre: currentUser.nombre,
          apellidos: currentUser.apellidos,
          email: currentUser.email
        });
      } else {
        // Si no hay usuario logueado, habilitar todos los campos
        this.reporteForm.get('ciudadanoNombre')?.enable();
        this.reporteForm.get('ciudadanoApellidos')?.enable();
        this.reporteForm.get('ciudadanoEmail')?.enable();
        this.reporteForm.get('ciudadanoTelefono')?.enable();
      }
    });
  }

  private generateTempUserId(): string {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      return currentUser.id;
    }
    // Si no hay usuario autenticado, usar Firebase Auth directamente
    const firebaseUser = this.firebaseAuth.getCurrentUser();
    return firebaseUser ? firebaseUser.uid : `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.reporteForm.get(fieldName);
    if (control?.errors && control.touched) {
      return ReporteValidators.getErrorMessage(control.errors);
    }
    return '';
  }

  hasError(fieldName: string): boolean {
    const control = this.reporteForm.get(fieldName);
    return !!(control?.errors && control.touched);
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/inicio']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }

  verDetalleReporte() {
    if (this.currentReporteId) {
      // Cancelar el contador de redirección
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.redirectCountdown = 0;
      }
      
      // Esperar un momento para asegurar que el reporte esté guardado
      setTimeout(() => {
        this.router.navigate(['/reporte-detalle', this.currentReporteId]);
      }, 1000);
    }
  }
}