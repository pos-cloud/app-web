
import { of as observableOf, merge as observableMerge } from 'rxjs';
import { Component } from '@angular/core';

import { Config } from './app.config';

import { ConfigService } from './services/config.service';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';
import 'moment/locale/es';
import { ToastrService } from 'ngx-toastr';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';



@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    public config$: any;
    public config: Config;
    public alertMessage = '';
    public loading = true;
    public modules: any;

    constructor(
        public _configService: ConfigService,
        public _authService: AuthService,
        public activeModal: NgbActiveModal,
        private _toastr: ToastrService,
        public alertConfig: NgbAlertConfig,
        public _modalService: NgbModal,
        public _router: Router,
        private _translateService: TranslateService
    ) {
        this._translateService.setDefaultLang('es');
        this.setApiConfigurationSettings();
        this.config$ = this._configService.getConfig;
        this.notification();
    }

    async ngOnInit() {
        this._authService.getIdentity.subscribe(
            async identity => {
                if (identity) {
                    await this.getConfigApi().then(
                        config => {
                            if (config) {
                                this._configService.setConfig(config);
                                this.setConfigurationSettings(config);
                            }
                        }
                    );
                } else {
                    this.config$ = observableMerge(
                        observableOf(true)
                    );
                }
            }
        );
    }

    public notification() {
        setInterval(() => {

            if (this.config && this.config['expirationLicense']) {

                var days = moment(this.config['expirationLicense'],'YYYY-MM-DD').diff(moment().format('YYYY-MM-DD'), 'days');
                
                if (!this.config['demo']) {
                    if (days < 5) {
                        this.showToast("Su licencia expiró por favor regularice su pago", "danger")
                    } else {
                        days = days + 5;
                        if (days == 0) {
                            this.showToast("Su licencia vence hoy", "warning")

                        }
                        if (days == 1) {
                            this.showToast("Su licencia vence en " + days + " día", "warning")

                        }
                        if (days < 5) {
                            this.showToast("Su licencia vence en " + days + " días", "warning")

                        }
                        if (days < 10) {
                            this.showToast("Su licencia vence en " + days + " días", "info")
                        }

                    }
                } else {
                    
                    if (days == 0) {
                        this.showToast("Su licencia demo vence hoy", "info")

                    }
                    if (days == 1) {
                        this.showToast("Su licencia demo vence en " + days + " día", "info")

                    }
                    if (days < 2) {
                        this.showToast("Su licencia demo vence en " + days + " días", "info")

                    }
                }
            }//3600000
        }, 10000)
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

    public setConfigurationSettings(config) {
        if (config.emailAccount) { Config.setConfigEmail(config.emailAccount, config.emailPassword) }
        if (config.companyName) {
            Config.setConfigCompany(
                config.companyPicture,
                config.companyName,
                config.companyAddress,
                config.companyPhone,
                config.companyVatCondition,
                config.companyStartOfActivity,
                config.companyGrossIncome,
                config.footerInvoice,
                config.companyFantasyName,
                config.country,
                config.timezone,
                config.currency,
                config.companyIdentificationType,
                config.companyIdentificationValue,
                config.licenseCost,
                config.companyPostalCode);
        }
        if (config.showLicenseNotification !== undefined) {
            Config.setConfigs(config.showLicenseNotification);
        }
        if (config.modules) {
            Config.setModules(config.modules);
        }
        this.config = config;
    }

    public setApiConfigurationSettings() {
        let hostname = window.location.hostname;
        let subdominio = '';
        if (hostname.includes('.poscloud.com.ar')) {
            subdominio = hostname.split('.poscloud.com.ar')[0]
                .replace(/\//g, "")
                .replace(/:/g, "")
                .replace(/http/g, "")
                .replace(/www./g, "")
                .replace(/https/g, "");
        }
        Config.setDatabase(subdominio);
        Config.setApiHost(hostname); // Prod
        Config.setApiPort(300);
    }

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
        this.alertConfig.type = type;
        this.alertConfig.dismissible = dismissible;
    }

    public hideMessage(): void {
        this.alertMessage = '';
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
