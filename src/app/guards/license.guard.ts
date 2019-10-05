import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/services/config.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Config } from 'app/app.config';

@Injectable()
export class LicenseGuard implements CanActivate {

  constructor(
    private _configService: ConfigService
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this._configService.getConfig.pipe(
      take(1),
      map((config: Config) => {
        if(next.data.module) {
          if(config) {
            if(eval(next.data.module)) return true; return false;
          } else {
            this.getConfigApi().then(
              config => {
                if(config) {
                  this._configService.setConfig(config);
                  if(eval(next.data.module)) return true; return false;
                }
              }
            );
          }
        }
        return true;
      })
    );
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
}