import { Injectable, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(
    private _router: Router
  ) {}
  toasts: any[] = [];

  // Muestra una notificación
  private show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  // Elimina un toast de la lista
  public remove(toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  public handleClick(toast) {
    this.remove(toast)
    if (toast.redirect !== ''){
      this._router.navigate([toast.redirect])
    }
  }

  // Métodos para notificaciones específicas
  private success(message: string, title: string, redirect: string) {
    this.show(message, { classname: 'bg-success text-light', header: title , redirect });
  }

  private error(message: string, title: string, redirect: string) {
    this.show(message, { classname: 'bg-danger text-light', header: title , redirect });
  }

  private info(message: string, title: string, redirect: string) {
    this.show(message, { classname: 'bg-info text-light', header: title , redirect });
  }

  // Método centralizado para manejar toasts
  showToast(
    result: any = null,
    type?: string,
    title: string = '',
    message: string = '',
    redirect?: string
  ): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        message = result.message;
        redirect = result.redirect;
      } else if (result.status >= 400) {
        type = 'danger';
        message = result.error?.message || result.message;
        redirect = result.redirect;

      } else {
        type = 'info';
        message = result.message;
        redirect = result.redirect;
      }
    }

    switch (type) {
      case 'success':
        this.success(message, title, redirect);
        break;
      case 'danger':
        this.error(message, title, redirect);
        break;
      default:
        this.info(message, title, redirect);
        break;
    }

  }
}
