import { Component, OnDestroy, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ReportesService } from '../../services/reportes.service';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
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
  private logger = inject(LoggerService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  reporteForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedFile: File | null = null;

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
    const formData = this.reporteForm.value;
    return {
      tipoServicio: formData.tipoServicio,
      direccion: formData.direccion.trim(),
      comentarios: formData.comentarios?.trim() || '',
      ciudadanoId: this.generateTempUserId(),
      ciudadanoNombre: formData.ciudadanoNombre.trim(),
      ciudadanoApellidos: formData.ciudadanoApellidos.trim(),
      ciudadanoEmail: formData.ciudadanoEmail.trim().toLowerCase(),
      ciudadanoTelefono: formData.ciudadanoTelefono.trim(),
      estado: EstadoReporte.PENDIENTE,
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
    this.logger.info('Reporte creado exitosamente', { reporteId });
    this.resetForm();
    setTimeout(() => this.router.navigate(['/mis-reportes']), 2000);
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
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.reporteForm.patchValue({
        ciudadanoNombre: currentUser.nombre,
        ciudadanoApellidos: currentUser.apellidos,
        ciudadanoEmail: currentUser.email
      });
      this.logger.info('Datos de usuario cargados', { userId: currentUser.id });
    }
  }

  private generateTempUserId(): string {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? currentUser.id : `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
}