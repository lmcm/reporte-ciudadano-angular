import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { LoggerService } from './logger.service';

export interface AppError {
  message: string;
  code?: string;
  timestamp: Date;
  context?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private logger = inject(LoggerService);
  private readonly maxErrors = 100;
  private errors: AppError[] = [];

  handleError(error: any, context?: string): Observable<never> {
    const appError = this.createAppError(error, context);
    this.processError(appError);
    return throwError(() => appError.message);
  }

  private createAppError(error: any, context?: string): AppError {
    return {
      message: this.extractMessage(error),
      code: error?.code || 'UNKNOWN_ERROR',
      timestamp: new Date(),
      context,
      severity: this.determineSeverity(error)
    };
  }

  private extractMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    return 'Ha ocurrido un error inesperado';
  }

  private determineSeverity(error: any): AppError['severity'] {
    if (error?.status >= 500) return 'critical';
    if (error?.status >= 400) return 'high';
    
    const code = error?.code;
    if (typeof code === 'string') {
      if (code.includes('permission')) return 'high';
      if (code.includes('network')) return 'medium';
    }
    
    return 'low';
  }

  private processError(error: AppError): void {
    this.addError(error);
    this.logError(error);
    
    if (error.severity === 'critical') {
      this.handleCriticalError(error);
    }
  }

  private addError(error: AppError): void {
    this.errors.unshift(error);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
  }

  private logError(error: AppError): void {
    const logData = {
      code: error.code,
      context: error.context,
      severity: error.severity,
      timestamp: error.timestamp.toISOString()
    };

    switch (error.severity) {
      case 'critical':
        this.logger.error(`CRÍTICO: ${error.message}`, logData);
        break;
      case 'high':
        this.logger.error(`ALTO: ${error.message}`, logData);
        break;
      case 'medium':
        this.logger.warn(`MEDIO: ${error.message}`, logData);
        break;
      case 'low':
        this.logger.info(`BAJO: ${error.message}`, logData);
        break;
    }
  }

  private handleCriticalError(error: AppError): void {
    // En producción, enviar a servicio de monitoreo
    this.logger.error('Error crítico detectado - requiere atención inmediata', {
      error: error.message,
      code: error.code,
      context: error.context,
      timestamp: error.timestamp
    });
  }

  showUserFriendlyError(error: { message: string; timestamp: Date }): void {
    // Implementar notificación al usuario (toast, snackbar, etc.)
    this.logger.info('Mostrando error al usuario', { message: error.message });
  }

  getRecentErrors(severity?: AppError['severity']): AppError[] {
    if (!severity) return [...this.errors];
    return this.errors.filter(error => error.severity === severity);
  }

  clearErrors(): void {
    this.errors = [];
    this.logger.info('Errores limpiados');
  }

  getErrorStats(): { total: number; bySeverity: Record<string, number> } {
    const stats = {
      total: this.errors.length,
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    };

    this.errors.forEach(error => {
      stats.bySeverity[error.severity]++;
    });

    return stats;
  }
}