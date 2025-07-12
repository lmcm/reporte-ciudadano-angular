import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { LoggerService } from './logger.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private logger: LoggerService,
    private errorHandlerService: ErrorHandlerService,
    private ngZone: NgZone
  ) {}

  handleError(error: any): void {
    // Ejecutar fuera de Angular zone para evitar loops infinitos
    this.ngZone.runOutsideAngular(() => {
      this.processError(error);
    });
  }

  private processError(error: any): void {
    const errorInfo = this.extractErrorInfo(error);
    
    // Log del error
    this.logger.error('Error global capturado', {
      message: errorInfo.message,
      stack: errorInfo.stack,
      source: errorInfo.source,
      timestamp: new Date().toISOString()
    });

    // Procesar con el servicio de manejo de errores
    this.errorHandlerService.handleError(error, 'GlobalErrorHandler');

    // En desarrollo, mostrar en consola
    if (!this.isProduction()) {
      console.group('🚨 Error Global');
      console.error('Mensaje:', errorInfo.message);
      console.error('Stack:', errorInfo.stack);
      console.error('Fuente:', errorInfo.source);
      console.error('Error original:', error);
      console.groupEnd();
    }
  }

  private extractErrorInfo(error: any): { message: string; stack?: string; source?: string } {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        source: error.name
      };
    }

    if (typeof error === 'string') {
      return { message: error, source: 'String Error' };
    }

    if (error?.rejection instanceof Error) {
      return {
        message: error.rejection.message,
        stack: error.rejection.stack,
        source: 'Promise Rejection'
      };
    }

    return {
      message: error?.message || 'Error desconocido',
      source: 'Unknown Error'
    };
  }

  private isProduction(): boolean {
    return typeof window !== 'undefined' && 
           window.location.hostname !== 'localhost' && 
           !window.location.hostname.includes('127.0.0.1');
  }
}