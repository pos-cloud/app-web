import { Activity } from '@types';

export interface Claim extends Activity {
  _id: string;
  name: string;
  description: string;
  type: ClaimType;
  priority: ClaimPriority;
  author: string;
  email: string;
  listName: string;
  file: string;
}

export enum ClaimPriority {
  High = 'Alta',
  Half = 'Media',
  Low = 'Baja',
}

export enum ClaimType {
  Suggestion = 'Sugerencia',
  Improvement = 'Mejora',
  Err = 'Error',
  Implementation = 'Nueva Implementación',
}
