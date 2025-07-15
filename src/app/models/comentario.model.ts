import { Timestamp } from 'firebase/firestore';

export interface Comentario {
  id?: string;
  reporteId: string;
  autorId: string;
  autorNombre: string;
  autorEmail: string;
  autorTipo: TipoAutor;
  texto: string;
  fechaCreacion: Timestamp | Date;
  activo: boolean;
}

export interface ComentarioCreate extends Omit<Comentario, 'id' | 'fechaCreacion' | 'activo'> {
  fechaCreacion?: Timestamp | Date;
  activo?: boolean;
}

export enum TipoAutor {
  CIUDADANO = 'ciudadano',
  AYUNTAMIENTO = 'ayuntamiento'
}