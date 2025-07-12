import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError, timer } from 'rxjs';
import { catchError, retryWhen, concatMap, finalize } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';
import { ErrorHandlerService } from '../services/error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const errorHandler = inject(ErrorHandlerService);
  const maxRetries = 3;
  const retryDelay = 1000;

  const shouldRetry = (error: HttpErrorResponse): boolean => {
    return !error.status || error.status >= 500;
  };

  const handleError = (error: HttpErrorResponse, duration: number): void => {
    const errorInfo = {
      url: req.url,
      method: req.method,
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      duration: `${duration}ms`
    };

    if (error.status >= 500) {
      logger.error('Error del servidor', errorInfo);
    } else if (error.status >= 400) {
      logger.warn('Error del cliente', errorInfo);
    } else {
      logger.error('Error de red', errorInfo);
    }

    errorHandler.handleError(error, `HTTP ${req.method} ${req.url}`);
  };

  const transformError = (error: HttpErrorResponse): string => {
    if (!error.status) {
      return 'Error de conexión. Verifique su conexión a internet.';
    }

    switch (error.status) {
      case 400: return 'Solicitud inválida. Verifique los datos enviados.';
      case 401: return 'No autorizado. Inicie sesión nuevamente.';
      case 403: return 'Acceso denegado. No tiene permisos para esta operación.';
      case 404: return 'Recurso no encontrado.';
      case 500: return 'Error interno del servidor. Intente más tarde.';
      default: return `Error inesperado (${error.status}). Contacte al soporte técnico.`;
    }
  };

  const startTime = Date.now();
  
  return next(req).pipe(
    retryWhen(errors => 
      errors.pipe(
        concatMap((error, index) => {
          if (index >= maxRetries || !shouldRetry(error)) {
            return throwError(() => error);
          }
          
          logger.warn(`Reintentando petición ${index + 1}/${maxRetries}`, {
            url: req.url,
            method: req.method,
            error: error.message
          });
          
          return timer(retryDelay * Math.pow(2, index));
        })
      )
    ),
    catchError((error: HttpErrorResponse) => {
      const duration = Date.now() - startTime;
      handleError(error, duration);
      return throwError(() => transformError(error));
    }),
    finalize(() => {
      const duration = Date.now() - startTime;
      logger.debug(`HTTP Request completed`, {
        url: req.url,
        method: req.method,
        duration: `${duration}ms`
      });
    })
  );
};