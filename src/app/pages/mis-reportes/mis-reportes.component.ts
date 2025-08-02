import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ReportesService } from '../../services/reportes.service';
import { AuthService } from '../../services/auth.service';
import { Reporte, EstadoReporte, TipoServicio } from '../../models/reporte.model';

@Component({
  selector: 'app-mis-reportes',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './mis-reportes.component.html',
  styles: []
})
export class MisReportesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private reportesService = inject(ReportesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  reportes: Reporte[] = [];
  loading = true;
  error: string | null = null;
  currentUser = this.authService.getCurrentUser();
  showEditForm = false;
  saving = false;
  editForm: FormGroup;
  showMobileMenu = false;

  constructor() {
    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      direccion: ['']
    });
  }

  ngOnInit() {
    this.cargarMisReportes();
    this.escucharCambiosEnTiempoReal();
    this.initializeForm();
    
    // Suscribirse a cambios del usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (this.showEditForm) {
          this.initializeForm();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarMisReportes() {
    const userEmail = this.authService.getCurrentUserEmail();
    
    if (!userEmail) {
      this.error = 'Usuario no autenticado';
      this.loading = false;
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    this.reportesService.obtenerReportes(
      { ciudadanoEmail: userEmail },
      { pageSize: 50 }
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        this.reportes = result.reportes;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los reportes: ' + error;
        this.loading = false;
      }
    });
  }

  verDetalle(reporteId: string) {
    this.router.navigate(['/reporte-detalle', reporteId]);
  }

  getStatusClass(estado: EstadoReporte): string {
    switch (estado) {
      case EstadoReporte.COMPLETADO:
        return 'bg-green-100 text-green-800';
      case EstadoReporte.EN_PROGRESO:
        return 'bg-yellow-100 text-yellow-800';
      case EstadoReporte.PENDIENTE:
        return 'bg-red-100 text-red-800';
      case EstadoReporte.CANCELADO:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(estado: EstadoReporte): string {
    switch (estado) {
      case EstadoReporte.COMPLETADO:
        return 'Completado';
      case EstadoReporte.EN_PROGRESO:
        return 'En Progreso';
      case EstadoReporte.PENDIENTE:
        return 'Pendiente';
      case EstadoReporte.CANCELADO:
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }

  getTipoServicioText(tipo: TipoServicio): string {
    switch (tipo) {
      case TipoServicio.LAMPARA:
        return 'Lámpara';
      case TipoServicio.BACHE:
        return 'Bache';
      case TipoServicio.FUGA_AGUA:
        return 'Fuga de Agua';
      case TipoServicio.BASURA:
        return 'Basura';
      case TipoServicio.OTRO:
        return 'Otro';
      default:
        return 'Desconocido';
    }
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return 'Sin fecha';
    
    try {
      let date: Date;
      
      if (fecha.toDate && typeof fecha.toDate === 'function') {
        // Timestamp de Firebase
        date = fecha.toDate();
      } else if (fecha instanceof Date) {
        date = fecha;
      } else if (typeof fecha === 'string' || typeof fecha === 'number') {
        date = new Date(fecha);
      } else {
        return 'Fecha inválida';
      }
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Error al formatear fecha:', error, fecha);
      return 'Fecha inválida';
    }
  }

  recargarReportes() {
    this.cargarMisReportes();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        // Redirigir de todas formas
        this.router.navigate(['/login']);
      }
    });
  }

  private escucharCambiosEnTiempoReal() {
    const userEmail = this.authService.getCurrentUserEmail();
    
    if (!userEmail) return;
    
    this.reportesService.escucharReportes({ ciudadanoEmail: userEmail })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reportes) => {
          // Solo actualizar si no estamos en estado de carga inicial
          if (!this.loading) {
            this.reportes = reportes;
          }
        },
        error: (error) => {
          console.error('Error en escucha tiempo real:', error);
        }
      });
  }

  private initializeForm() {
    if (this.currentUser) {
      this.editForm.patchValue({
        nombre: this.currentUser.nombre || '',
        apellidos: this.currentUser.apellidos || '',
        email: this.currentUser.email || '',
        telefono: (this.currentUser as any).telefono || '',
        direccion: (this.currentUser as any).direccion || ''
      });
      // Marcar el formulario como pristine después de inicializar
      this.editForm.markAsPristine();
    }
  }

  toggleEditProfile() {
    this.showEditForm = !this.showEditForm;
    if (this.showEditForm) {
      this.initializeForm();
    }
  }

  cancelEdit() {
    this.showEditForm = false;
    this.initializeForm();
  }

  saveProfile() {
    if (this.editForm.valid && !this.saving) {
      this.saving = true;
      
      const formData = this.editForm.value;
      
      // Actualizar el usuario actual con los nuevos datos
      this.authService.updateUserProfile(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedUser) => {
            this.currentUser = updatedUser;
            this.saving = false;
            this.showEditForm = false;
            console.log('Perfil actualizado exitosamente');
          },
          error: (error) => {
            console.error('Error al actualizar perfil:', error);
            this.saving = false;
          }
        });
    }
  }

  isFormValid(): boolean {
    return this.editForm.valid && this.editForm.dirty;
  }

  getFieldError(fieldName: string): string | null {
    const field = this.editForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors?.['email']) {
        return 'Ingresa un email válido';
      }
      if (field.errors?.['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors?.['pattern']) {
        return 'Formato inválido';
      }
    }
    return null;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }
}