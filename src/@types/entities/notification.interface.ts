import { Activity } from '@types';

export interface Notification extends Activity {
  _id: string;
  title: string;
  message: string;
  type: string;
  payload?: Record<string, unknown>;
  branch?: string;
  recipientUser?: string;
  read: boolean;
  readAt?: string;
  readByUsers?: string[];
}

export enum NotificationType {
  ArticleUpdated = 'ARTICLE_UPDATED',
  General = 'GENERAL',
  TiendaNubeOrder = 'TIENDANUBE_ORDER',
  License = 'LICENSE',
  Transaction = 'TRANSACTION',
  Table = 'TABLE',
}
