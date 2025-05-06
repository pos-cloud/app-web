import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgbActiveModal, NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { merge as observableMerge, of as observableOf } from 'rxjs';

import { Config } from './app.config';
import { AuthService } from './core/services/auth.service';
import { ConfigService } from './core/services/config.service';

import 'moment/locale/es';
import { ToastService } from './shared/components/toast/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  public config$: any;
  public config: Config;
  public alertMessage = '';
  public loading = true;
  public modules: any;
  public isVerifyNotification: boolean = false;
  public readedNotification: boolean = false;
  public showHeader: boolean = true;

  constructor(
    public _configService: ConfigService,
    public _authService: AuthService,
    public activeModal: NgbActiveModal,
    private _toastService: ToastService,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _router: Router,
    private _translateService: TranslateService
  ) {
    this._translateService.setDefaultLang('es');
    this._translateService.use('es');
    this.setApiConfigurationSettings();
    this.config$ = this._configService.getConfig;
  }

  async ngOnInit() {
    this._authService.getIdentity.subscribe(async (identity) => {
      if (identity) {
        await this.getConfigApi().then((config) => {
          if (config) {
            this._configService.setConfig(config);
            this.setConfigurationSettings(config);
            this.verifyNotification();
          }
        });
      } else {
        this.config$ = observableMerge(observableOf(true));
      }
    });

    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.url;
        if (currentUrl.includes('menu') || currentUrl.includes('galleries/view')) {
          this.showHeader = false;
        }
      }
    });
  }

  public verifyNotification() {
    if (!this.isVerifyNotification) {
      this.isVerifyNotification = true;
      this.execNotification();
      setInterval(() => {
        this.execNotification();
      }, 3600000);
    }
  }

  public execNotification() {
    let message: string;

    if (this.config && this.config['expirationLicenseDate']) {
      let days = moment(moment(this.config['expirationLicenseDate']).format('YYYY-MM-DD'), 'YYYY-MM-DD').diff(
        moment().format('YYYY-MM-DD'),
        'days'
      );

      days++;
      if (!this.config['demo']) {
        if (days <= 0) {
          message = 'Su licencia expiró, por favor, regularice su pago.';
          this._toastService.showToast({ message, type: 'danger' });
        } else {
          if (days == 1) {
            message = 'Su licencia vence hoy.';
            this._toastService.showToast({ message, type: 'warning' });
          }
          if (days <= 5 && days > 1) {
            message = 'Su licencia vence en ' + days + ' días.';
            this._toastService.showToast({ message, type: 'warning' });
          }
          if (days <= 10 && days > 5) {
            message = 'Su licencia vence en ' + days + ' días.';
            this._toastService.showToast({ message, type: 'info' });
          }
        }
      } else {
        if (days == 1) {
          message = 'Su licencia vence hoy.';
          this._toastService.showToast({ message, type: 'warning' });
        }
        if (days > 1) {
          message = 'Su licencia de prueba vence en ' + days + ' días.';
          this._toastService.showToast({ message, type: 'info' });
        }
      }

      localStorage.setItem('notificationMessage', message);
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

  public setConfigurationSettings(config) {
    if (config.emailAccount) {
      Config.setConfigEmail(config.emailAccount, config.emailPassword);
    }
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
        config.companyPostalCode
      );
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
    let isLocal = false;
    let hostname = window.location.hostname;
    let subdominio = '';

    if (hostname.includes('.poscloud.com.ar') || hostname.includes('.poscloud.ar')) {
      if (hostname.includes('.poscloud.com.ar')) {
        subdominio = hostname.split('.poscloud.com.ar')[0];
      } else {
        subdominio = hostname.split('.poscloud.ar')[0];
      }
      subdominio = subdominio
        .replace(/\//g, '')
        .replace(/:/g, '')
        .replace(/http/g, '')
        .replace(/www./g, '')
        .replace(/https/g, '');
    }

    if (hostname.includes('192.168.0.88') || hostname.includes('jacksonburgs.hopto.org')) {
      subdominio = 'jacksonburgs';
      isLocal = true;
    }

    if (environment.production) {
      Config.setDatabase(subdominio);
      if (isLocal) {
        Config.setApiHost('http://' + hostname + ':300'); // LOCAL
        Config.setApiV8Host('http://' + hostname + ':308'); // LOCAL
      } else {
        // Config.setApiHost('https://api.poscloud.com.ar'); // DONWEB
        // Config.setApiV8Host('https://apiv8.poscloud.com.ar'); // DONWEB

        Config.setApiHost(environment.api); // TEST
        Config.setApiV8Host(environment.apiv2); // TEST
      }
    } else {
      Config.setApiHost(environment.api); // TEST
      Config.setApiV8Host(environment.apiv2); // TEST
    }
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
