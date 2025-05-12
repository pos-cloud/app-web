import { Injectable, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private _router: Router) { }
  toasts: any[] = [];

  private show(
    textOrTpl: string | TemplateRef<any>,
    options: any = {}
  ) {
    if (options.position) {
      options.classname = `${options.classname || ''} ${options.position}`;
    }

    this.toasts.push({
      textOrTpl,
      ...options
    });
  }

  public remove(toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  public handleClick(toast) {
    this.remove(toast);
    if (toast.redirect) {
      this._router.navigate([toast.redirect]);
    }
  }

  public calculateNotificationSettings(days: number): { type: 'danger' | 'warning' | 'info', delay: number } {
    let type: 'danger' | 'warning' | 'info' = 'info';
    let delay = 0;

    if (days <= 0) {
      type = 'danger';
      delay = 86400000;
    } else if (days <= 5) {
      type = 'warning';
      delay = (11 - days) * 60 * 1000; 
    } else if (days <= 10) {
      type = 'info';
      delay = (11 - days) * 60 * 1000; 
    } else {
      type = 'info';
      delay = 5000;
    }

    return { type, delay };
  }

  private success(
    message: string,
    title: string,
    redirect: string,
    delay: number,
    position: string
  ) {
    this.show(message, {
      classname: 'bg-success text-light',
      header: title,
      redirect,
      delay,
      position
    });
  }

  private error(
    message: string,
    title: string,
    redirect: string,
    delay: number,
    position: string
  ) {
    this.show(message, {
      classname: 'bg-danger text-light',
      header: title,
      redirect,
      delay,
      position
    });
  }

  private warning(
    message: string,
    title: string,
    redirect: string,
    delay: number,
    position: string
  ) {
    this.show(message, {
      classname: 'bg-warning text-light',
      header: title,
      redirect,
      delay,
      position
    });
  }

  private info(
    message: string,
    title: string,
    redirect: string,
    delay: number,
    position: string
  ) {
    this.show(message, {
      classname: 'bg-info text-light',
      header: title,
      redirect,
      delay,
      position
    });
  }

  showToast(
    result: any = null,
    type?: string,
    title: string = '',
    message: string = '',
    redirect?: string,
    delay: number = 5000,
    position: string = 'bottom-right'
  ): void {
    if (result !== null) {
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
    console.log(type,message);
    switch (type) {
      case 'success':
        this.success(message, title, redirect, delay, position);
        break;
      case 'danger':
        this.error(message, title, redirect, delay, position);
        break;
      case 'warning':
        this.warning(message, title, redirect, delay, position);
      break;
      default:
        this.info(message, title, redirect, delay, position);
        break;
    }
  }
}