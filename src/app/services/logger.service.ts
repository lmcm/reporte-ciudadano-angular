import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  source?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly maxLogs = 1000;
  private logs: LogEntry[] = [];
  private currentLogLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;

  error(message: string, data?: any, source?: string): void {
    this.log(LogLevel.ERROR, message, data, source);
  }

  warn(message: string, data?: any, source?: string): void {
    this.log(LogLevel.WARN, message, data, source);
  }

  info(message: string, data?: any, source?: string): void {
    this.log(LogLevel.INFO, message, data, source);
  }

  debug(message: string, data?: any, source?: string): void {
    this.log(LogLevel.DEBUG, message, data, source);
  }

  private log(level: LogLevel, message: string, data?: any, source?: string): void {
    if (level > this.currentLogLevel) return;

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      source: source || this.getCallerInfo()
    };

    this.addLogEntry(logEntry);
    this.outputToConsole(logEntry);

    // En producción, enviar logs críticos a servicio externo
    if (environment.production && level <= LogLevel.WARN) {
      this.sendToExternalService(logEntry);
    }
  }

  private addLogEntry(entry: LogEntry): void {
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${LogLevel[entry.level]}] [${entry.source}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(message, entry.data);
        break;
      case LogLevel.DEBUG:
        console.debug(message, entry.data);
        break;
    }
  }

  private getCallerInfo(): string {
    const stack = new Error().stack;
    if (!stack) return 'Unknown';
    
    const lines = stack.split('\n');
    // Buscar la línea que no sea del logger
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      if (line && !line.includes('logger.service')) {
        const match = line.match(/at\s+(.+?)\s+\(/);
        return match ? match[1] : 'Unknown';
      }
    }
    return 'Unknown';
  }

  private sendToExternalService(entry: LogEntry): void {
    // Implementar envío a servicio externo (Sentry, LogRocket, etc.)
    // Por ahora solo simulamos
    if (!environment.production) return;
    
    try {
      // Ejemplo: fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
      console.warn('Log crítico que debería enviarse a servicio externo:', entry);
    } catch (error) {
      console.error('Error enviando log a servicio externo:', error);
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level === undefined) return [...this.logs];
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }

  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }
}