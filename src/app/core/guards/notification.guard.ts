import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from '@angular/router';
import { Config } from 'app/app.config';
import { ConfigService } from 'app/core/services/config.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable()
export class NotificationGuard implements CanActivate {
  public config: Config;

  constructor(
    private _configService: ConfigService,
    private _toastService: ToastService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this._configService.getConfig.pipe(
      take(1),
      map((config: Config) => {
        if (config["expirationLicenseDate"]) {
          const dueDate = new Date(config["expirationLicenseDate"]);
          const today = new Date();
          
          dueDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          
          const timeDiff = dueDate.getTime() - today.getTime();
          let days = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;

          let message: string;
          let toastType: string;
          let toastDelay: number;

          if (!config["demo"]) {
            const settings = this._toastService.calculateNotificationSettings(days);
            toastType = settings.type;
            toastDelay = settings.delay;
          
            if (days <= 0) {
              message = 'Su licencia expiró, por favor, regularice su pago.';
            } else if (days === 1) {
              message = 'Su licencia vence hoy.';
            } else if (days <= 5) {
              message = `Su licencia vence en ${days} días.`;
            } else if (days <= 10) {
              message = `Su licencia vence en ${days} días.`;
            }

            if (message) {
              this._toastService.showToast(
                null,
                toastType,
                "",
                message,
                "/license",
                toastDelay,
                "bottom-right"
              );
            }
          } else {
            if (days === 1) {
              message = 'Su licencia vence hoy.';
              this._toastService.showToast({ message, type: 'warning' });
            } else if (days > 1) {
              message = `Su licencia de prueba vence en ${days} días.`;
              this._toastService.showToast({ message, type: 'info' });
            }
          }

          if (message) {
            localStorage.setItem('notificationMessage', message);
          }
        }
        return true;
      })
    );
  }
}