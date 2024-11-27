import { Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: any[] = [];

  // Muestra una notificación
  private show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  // Elimina un toast de la lista
  remove(toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  // Métodos para notificaciones específicas
  private success(message: string, title: string) {
    this.show(message, {
      classname: 'bg-success text-light',
      header: title,
    });
  }

  private error(message: string, title: string) {
    this.show(message, { classname: 'bg-danger text-light', header: title });
  }

  private info(message: string, title: string) {
    this.show(message, { classname: 'bg-info text-light', header: title });
  }

  // Método centralizado para manejar toasts
  showToast(
    result: any = null,
    type?: string,
    title: string = '',
    message: string = ''
  ): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        message = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        message = result.error?.message || result.message;
      } else {
        type = 'info';
        message = result.message;
      }
    }

    switch (type) {
      case 'success':
        this.success(message, title);
        break;
      case 'danger':
        this.error(message, title);
        break;
      default:
        this.info(message, title);
        break;
    }
  }
}
