import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/components/config/config.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Config } from 'app/app.config';
import * as moment from 'moment';
import 'moment/locale/es';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class NotificationGuard implements CanActivate {

    constructor(
        private _configService: ConfigService,
        private _toastr: ToastrService
    ) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this._configService.getConfig.pipe(
            take(1),
            map((config: Config) => {
                if (config && config['licensePaymentDueDate']) {
                    let days = moment(config['licensePaymentDueDate']).diff(moment(),'days');

                    if(config['demo']){
                        if(days = 0) {
                            this.showToast("Su licencia demo vence hoy" ,"info")
                            return true;
                        }
                        if(days = 1) {
                            this.showToast("Su licencia demo vence en " +days+ " día" ,"info")
                            return true;
                        }
                        if(days < 2 ){
                            this.showToast("Su licencia demo vence en " +days+ " días" ,"info")
                            return true;
                        }
                        return true;
                    } else {
                        if( days < 5 ){
                            this.showToast("Su licencia expiró por favor regularice su pago","danger")
                            return true;
                        } else {
                            days = days + 5;
                            if(days = 0) {
                                this.showToast("Su licencia vence hoy" ,"warning")
                                return true;
                            }
                            if(days = 1) {
                                this.showToast("Su licencia vence en " +days+ " día" ,"warning")
                                return true;
                            }
                            if(days < 5 ){
                                this.showToast("Su licencia vence en " +days+ " días" ,"warning")
                                return true;
                            }
                            if(days < 10) {
                                this.showToast("Su licencia vence en " +days+ " días" ,"info")
                                return true;
                            }
                            return true;
                        }
                    }
                }
            })
            )
    }

    public showToast(message: string, type: string = 'success'): void {
        switch (type) {
            case 'success':
                this._toastr.success('', message);
                break;
            case 'info':
                this._toastr.info('', message,{
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
