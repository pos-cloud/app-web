
import {of as observableOf, merge as observableMerge } from 'rxjs';
import { Component } from '@angular/core';

import { Config } from './app.config';

import { ConfigService } from './services/config.service';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

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
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _router: Router,
  ) {
    this.setApiConfigurationSettings();
    this.config$ = this._configService.getConfig;
  }

  async ngOnInit() {
    this._authService.getIdentity.subscribe(
      async identity => {
        if(identity) {
          await this.getConfigApi().then(
            config => {
              if(config) {
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
    if (config.companyName) { Config.setConfigCompany(config.companyPicture, config.companyName, config.companyAddress, config.companyPhone,
                                                    config.companyVatCondition, config.companyStartOfActivity, config.companyGrossIncome, config.footerInvoice, config.companyFantasyName,
                                                    config.country, config.timezone, config.currency, config.companyIdentificationType, config.companyIdentificationValue, config.licenseCost,
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
    if(hostname.includes('.poscloud.com.ar')) {
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
}
