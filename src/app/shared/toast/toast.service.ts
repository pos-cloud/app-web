import { Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: any[] = [];

  // Muestra una notificación
  show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  // Elimina un toast de la lista
  remove(toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  // Métodos para notificaciones específicas
  success(message: string, title: string) {
    this.show(message, {
      classname: 'bg-success text-light',
      header: title,
    });
  }

  error(message: string, title: string) {
    this.show(message, { classname: 'bg-danger text-light', header: title });
  }

  info(message: string, title: string) {
    this.show(message, { classname: 'bg-info text-light', header: title });
  }
}
