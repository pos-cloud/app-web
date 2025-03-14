import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Config } from 'app/app.config';
import { ConfigService } from 'app/core/services/config.service';
import * as moment from 'moment';
import 'moment/locale/es';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable()
export class LicenseGuard implements CanActivate {
  constructor(
    private _configService: ConfigService,
    private _router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this._configService.getConfig.pipe(
      take(1),
      map((config: Config) => {
        if (next.data.module) {
          if (config) {
            return this.checkLicense(config, next);
          } else {
            this.getConfigApi().then((config) => {
              if (config) {
                this._configService.setConfig(config);
                return this.checkLicense(config, next);
              }
            });
          }
        } else {
          this.getConfigApi().then((config) => {
            if (config) {
              this._configService.setConfig(config);
              return this.checkLicense(config, next);
            }
          });
        }
        return true;
      })
    );
  }

  public checkLicense(config: Config, next: ActivatedRouteSnapshot) {
    if (config && config['licensePaymentDueDate']) {
      let days = moment(
        moment(config['licensePaymentDueDate']).format('YYYY-MM-DD'),
        'YYYY-MM-DD'
      ).diff(moment().format('YYYY-MM-DD'), 'days');
      days++;
      let daysOfPay = moment(
        config['licensePaymentDueDate'],
        'YYYY-MM-DD'
      ).diff(moment().format('YYYY-MM-DD'), 'days');
      if (days >= 1 && daysOfPay > 0) {
        if (!next.data.module) {
          return true;
        } else if (eval(next.data.module)) return true;
        return false;
      } else {
        this._router.navigate(['/license']);
        return false;
      }
    } else {
      return false;
    }
  }

  public getConfigApi(): Promise<Config> {
    return new Promise<Config>((resolve, reject) => {
      this._configService.getConfigApi().subscribe(
        (result) => {
          if (!result.configs) {
            resolve(null);
          } else {
            resolve(result.configs[0]);
          }
        },
        (error) => {
          resolve(null);
        }
      );
    });
  }
}
