import { Timestamp, FieldValue } from 'firebase/firestore';

export interface HistorialEstado {
  estado: EstadoReporte;
  fecha: Timestamp | Date | FieldValue;
  usuario?: string;
}

export interface Reporte {
  id?: string;
  folio?: string;
  tipoServicio: TipoServicio;
  direccion: string;
  coordenadas?: Coordenadas;
  comentarios: string;
  estado: EstadoReporte;
  historialEstados?: HistorialEstado[];
  fechaCreacion: Timestamp | Date;
  fechaActualizacion: Timestamp | Date;
  ciudadanoId: string;
  ciudadanoNombre: string;
  ciudadanoApellidos: string;
  ciudadanoEmail: string;
  ciudadanoTelefono: string;
  evidenciasFotograficas?: string[];
  personalAsignado?: string;
  prioridad: PrioridadReporte;
  activo: boolean;
}

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface ReporteCreate extends Omit<Reporte, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'activo'> {
  fechaCreacion?: Timestamp | Date;
  fechaActualizacion?: Timestamp | Date;
  activo?: boolean;
}

export interface ReporteUpdate {
  tipoServicio?: TipoServicio;
  direccion?: string;
  coordenadas?: Coordenadas;
  comentarios?: string;
  estado?: EstadoReporte;
  historialEstados?: HistorialEstado[];
  fechaActualizacion?: Timestamp | Date | FieldValue;
  ciudadanoNombre?: string;
  ciudadanoApellidos?: string;
  ciudadanoEmail?: string;
  ciudadanoTelefono?: string;
  evidenciasFotograficas?: string[];
  personalAsignado?: string;
  prioridad?: PrioridadReporte;
  activo?: boolean;
}

export enum EstadoReporte {
  PENDIENTE = 'pendiente',
  EN_PROGRESO = 'en_progreso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado'
}

export enum PrioridadReporte {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica'
}

export enum TipoServicio {
  LAMPARA = 'lampara',
  BACHE = 'bache',
  FUGA_AGUA = 'fuga_agua',
  BASURA = 'basura',
  OTRO = 'otro'
}