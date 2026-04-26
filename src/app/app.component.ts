import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgbActiveModal, NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { merge as observableMerge, of as observableOf } from 'rxjs';

import { Config } from './app.config';
import { AuthService } from './core/services/auth.service';
import { ConfigService } from './core/services/config.service';
import { PlausibleService } from './core/services/plausible.service';

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
    private _translateService: TranslateService,
    private _plausibleService: PlausibleService
  ) {
    this._translateService.setDefaultLang('es');
    this._translateService.use('es');
    this.config$ = this._configService.getConfig;
  }

  async ngOnInit() {
    // Inicializar el tracking de Plausible (solo una vez)
    this._plausibleService.initializeTracking();

    this._authService.getIdentity.subscribe(async (identity) => {
      if (identity) {
        await this.getConfigApi().then((config) => {
          if (config) {
            this._configService.setConfig(config);
            this.setConfigurationSettings(config);
          }
        });
      } else {
        this.config$ = observableMerge(observableOf(true));
      }
    });

    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.url;
        if (
          currentUrl.includes('menu') ||
          currentUrl.includes('galleries/view') ||
          currentUrl.includes('politicas-de-privacidad')
        ) {
          this.showHeader = false;
        } else {
          this.showHeader = true;
        }
      }
    });
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
    this.config = config;
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
