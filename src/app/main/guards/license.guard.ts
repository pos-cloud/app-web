import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { ConfigService } from 'app/components/config/config.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Config } from 'app/app.config';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import 'moment/locale/es';

@Injectable()
export class LicenseGuard implements CanActivate {

  constructor(
    private _configService: ConfigService,
    private _toastr: ToastrService,
    private _router: Router
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this._configService.getConfig.pipe(
      take(1),
      map((config: Config) => {
        if(next.data.module) {
          if(config) {
            return this.checkLicense(config, next);
          } else {
            this.getConfigApi().then(
              config => {
                if(config) {
                  this._configService.setConfig(config);
                  return this.checkLicense(config, next);
                }
              }
            );
          }
        } else {
          this.getConfigApi().then(
            config => {
              if (config) {
                this._configService.setConfig(config);
                return this.checkLicense(config, next);
              }
            }
          );
        }
        return true;
      })
    );
  }

  public checkLicense(config: Config, next: ActivatedRouteSnapshot) {
    if (config && config['licensePaymentDueDate']) {
      var days = moment(moment(config['licensePaymentDueDate']).format('YYYY-MM-DD'), 'YYYY-MM-DD').diff(moment().format('YYYY-MM-DD'), 'days');
      days++;
      var daysOfPay = moment(config['licensePaymentDueDate'], 'YYYY-MM-DD').diff(moment().format('YYYY-MM-DD'), 'days');
      if (days >= 1 && daysOfPay > 0) {
        if (!next.data.module) {
          return true;
        } else if (eval(next.data.module)) return true; return false;
      } else {
        this._router.navigate(['/admin/configuraciones']);
        return false;
      }
    } else {
      return false;
    }
  }

  public getConfigApi(): Promise<Config> {

    return new Promise<Config>((resolve, reject) => {
      this._configService.getConfigApi().subscribe(
        result => {
          if (!result.configs) {
            resolve(null);
          } else {
            resolve(result.configs[0]);
          }
        },
        error => {
          resolve(null);
        }
      );
    });
  }

  public showToast(message: string, type: string = 'success'): void {
    switch (type) {
      case 'success':
        this._toastr.success('', message);
        break;
      case 'info':
        this._toastr.info('', message, {
          positionClass: 'toast-bottom-left'
        });
        break;
      case 'warning':
        this._toastr.warning('', message, {
          positionClass: 'toast-bottom-left'
        });
        break;
      case 'danger':
        this._toastr.error('', message, {
          positionClass: 'toast-bottom-left'
        });
        break;
      default:
        this._toastr.success('', message);
        break;
    }
  }
}
