import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from '@angular/router';
import { Config } from 'app/app.config';
import { ConfigService } from 'app/core/services/config.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import * as moment from 'moment';
import 'moment/locale/es';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable()
export class NotificationGuard implements CanActivate {
  constructor(
    private _configService: ConfigService,
    private _toast: ToastService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this._configService.getConfig.pipe(
      take(1),
      map((config: Config) => {
        if (config && config['licensePaymentDueDate']) {
          let days = moment(config['licensePaymentDueDate']).diff(
            moment(),
            'days'
          );

          if (config['demo']) {
            if ((days = 0)) {
              this._toast.showToast({
                message: 'Su licencia demo vence hoy',
                type: 'info',
              });
              return true;
            }
            if ((days = 1)) {
              this._toast.showToast({
                message: 'Su licencia demo vence en ' + days + ' día',
                type: 'info',
              });
              return true;
            }
            if (days < 2) {
              this._toast.showToast({
                message: 'Su licencia demo vence en ' + days + ' días',
                type: 'info',
              });
              return true;
            }
            return true;
          } else {
            if (days < 5) {
              this._toast.showToast({
                message: 'Su licencia expiró por favor regularice su pago',
                type: 'danger',
              });
              return true;
            } else {
              days = days + 5;
              if ((days = 0)) {
                this._toast.showToast({
                  message: 'Su licencia vence hoy',
                  type: 'danger',
                });
                return true;
              }
              if ((days = 1)) {
                this._toast.showToast({
                  message: 'Su licencia vence en ' + days + ' día',
                  toast: 'danger',
                });
                return true;
              }
              if (days < 5) {
                this._toast.showToast({
                  message: 'Su licencia vence en ' + days + ' días',
                  type: 'danger',
                });
                return true;
              }
              if (days < 10) {
                this._toast.showToast({
                  message: 'Su licencia vence en ' + days + ' días',
                  type: 'info',
                });
                return true;
              }
              return true;
            }
          }
        }
      })
    );
  }
}
