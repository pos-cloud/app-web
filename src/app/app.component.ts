import {Component} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {NgbModal, NgbAlertConfig, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {environment} from 'environments/environment';
import * as moment from 'moment';
import {ToastrService} from 'ngx-toastr';
import {of as observableOf, merge as observableMerge} from 'rxjs';

import {Config} from './app.config';
import {ConfigService} from './components/config/config.service';
import {AuthService} from './components/login/auth.service';

import 'moment/locale/es';
import { SocketService } from './main/services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
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
    private _toastr: ToastrService,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _router: Router,
    private _translateService: TranslateService,
    private _socket: SocketService
  ) {
    this._translateService.setDefaultLang('es');
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
        if(currentUrl.includes('menu')) {
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
      let days = moment(
        moment(this.config['expirationLicenseDate']).format('YYYY-MM-DD'),
        'YYYY-MM-DD',
      ).diff(moment().format('YYYY-MM-DD'), 'days');

      days++;
      if (!this.config['demo']) {
        if (days <= 0) {
          message = 'Su licencia expiró, por favor, regularice su pago.';
          this.showToast(message, 'danger');
        } else {
          if (days == 1) {
            message = 'Su licencia vence hoy.';
            this.showToast(message, 'warning');
          }
          if (days <= 5 && days > 1) {
            message = 'Su licencia vence en ' + days + ' días.';
            this.showToast(message, 'warning');
          }
          if (days <= 10 && days > 5) {
            message = 'Su licencia vence en ' + days + ' días.';
            this.showToast(message, 'info');
          }
        }
      } else {
        if (days == 1) {
          message = 'Su licencia vence hoy.';
          this.showToast(message, 'warning');
        }
        if (days > 1) {
          message = 'Su licencia de prueba vence en ' + days + ' días.';
          this.showToast(message, 'info');
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
        },
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
        config.companyPostalCode,
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

    if (
      hostname.includes('192.168.0.88') ||
      hostname.includes('jacksonburgs.hopto.org')
    ) {
      subdominio = 'jacksonburgs';
      isLocal = true;
    }
    if (hostname.includes('192.168.2.108') || hostname.includes('eldesafioll.con-ip')) {
      subdominio = 'eldesafio';
      isLocal = true;
    }
    if (hostname.includes('192.168.88.90') || hostname.includes('186.127.35.89')) {
      subdominio = 'granpaso';
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

  public showToast(message: string, type: string = 'success'): void {
    switch (type) {
      case 'success':
        this._toastr.success('', message);
        break;
      case 'info':
        this._toastr.info('', message, {
          positionClass: 'toast-bottom-left',
        });
        break;
      case 'warning':
        this._toastr.warning('', message, {
          positionClass: 'toast-bottom-left',
        });
        break;
      case 'danger':
        this._toastr.error('', message, {
          positionClass: 'toast-bottom-left',
        });
        break;
      default:
        this._toastr.success('', message);
        break;
    }
  }
}
