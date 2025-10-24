import { Component, OnDestroy, inject, OnInit, AfterViewInit } from '@angular/core';
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

declare var L: any;

@Component({
  selector: 'app-nuevo-reporte',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, HeaderComponent],
  templateUrl: './nuevo-reporte.component.html',
  styles: []
})
export class NuevoReporteComponent implements OnInit, OnDestroy, AfterViewInit {
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
  private map: any;
  private marker: any;
  selectedLocation: {lat: number, lng: number} | null = null;

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
    this.loadLeaflet();
  }

  ngAfterViewInit(): void {
    // El mapa se inicializará cuando Google Maps se cargue
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.logger.info('NuevoReporteComponent destruido');
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
    
    this.map = L.map('map').setView(bocaDelRio, 13);
    
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
    
    this.logger.info('Ubicación seleccionada en mapa', this.selectedLocation);
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
          
          this.logger.info('Dirección obtenida', { address, data });
        }
      })
      .catch(error => {
        this.logger.error('Error al obtener dirección', error);
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

    // Validar imagen requerida
    if (!this.selectedFile) {
      this.errorMessage = 'Es obligatorio agregar una evidencia fotográfica del problema reportado.';
      setTimeout(() => {
        const errorElement = document.querySelector('.error-message');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
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
      evidenciasFotograficas: this.selectedFile ? [] : undefined,
      coordenadas: this.selectedLocation ? {
        lat: this.selectedLocation.lat,
        lng: this.selectedLocation.lng
      } : undefined
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
    this.errorMessage = this.getDescriptiveErrorMessage(error);
    this.logger.error('Error al crear reporte', { error });
    
    // Scroll al mensaje de error
    setTimeout(() => {
      const errorElement = document.querySelector('.error-message');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  private resetForm(): void {
    this.reporteForm.reset();
    this.selectedFile = null;
    this.selectedLocation = null;
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
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

  private getDescriptiveErrorMessage(error: string): string {
    // Log del error original para debug
    console.error('Error original:', error);
    
    // Verificar si faltan campos requeridos
    const formData = this.reporteForm.getRawValue();
    const missingFields = [];
    const invalidFields = [];
    
    if (!formData.tipoServicio) missingFields.push('Tipo de servicio');
    if (!formData.direccion?.trim()) missingFields.push('Dirección');
    if (!formData.comentarios?.trim()) missingFields.push('Comentarios');
    if (!formData.ciudadanoNombre?.trim()) missingFields.push('Nombre');
    if (!formData.ciudadanoApellidos?.trim()) missingFields.push('Apellidos');
    if (!formData.ciudadanoEmail?.trim()) missingFields.push('Correo electrónico');
    if (!formData.ciudadanoTelefono?.trim()) missingFields.push('Teléfono');
    if (!this.selectedFile) missingFields.push('Evidencia fotográfica');
    
    // Validar formato de campos
    if (formData.ciudadanoEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ciudadanoEmail)) {
      invalidFields.push('Correo electrónico (formato inválido)');
    }
    if (formData.ciudadanoTelefono && !/^[0-9]{10}$/.test(formData.ciudadanoTelefono)) {
      invalidFields.push('Teléfono (debe tener 10 dígitos)');
    }
    
    if (missingFields.length > 0) {
      return `Faltan campos obligatorios: ${missingFields.join(', ')}.`;
    }
    
    if (invalidFields.length > 0) {
      return `Campos con formato incorrecto: ${invalidFields.join(', ')}.`;
    }
    
    // Verificar errores específicos de Firebase/Backend
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('permission') || errorLower.includes('unauthorized')) {
      return 'Sin permisos para crear reportes. Inicia sesión nuevamente.';
    }
    
    if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('fetch')) {
      return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
    }
    
    if (errorLower.includes('storage') || errorLower.includes('upload') || errorLower.includes('file')) {
      return 'Error al procesar la imagen. Verifica que sea PNG/JPG y menor a 10MB.';
    }
    
    if (errorLower.includes('validation') || errorLower.includes('invalid') || errorLower.includes('required')) {
      return 'Datos inválidos. Revisa todos los campos y corrige los errores.';
    }
    
    if (errorLower.includes('firestore') || errorLower.includes('database')) {
      return 'Error en la base de datos. Intenta nuevamente en unos momentos.';
    }
    
    // Mostrar error original si es descriptivo
    if (error.length > 10 && error.length < 200 && !error.includes('Error:')) {
      return `Error: ${error}`;
    }
    
    // Mensaje genérico con sugerencias específicas
    return `No se pudo crear el reporte. Posibles causas:\n• Verifica tu conexión a internet\n• Asegúrate de que todos los campos estén completos\n• Si agregaste una imagen, verifica que sea válida\n• Intenta nuevamente en unos momentos`;
  }
}