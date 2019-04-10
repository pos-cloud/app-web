import { Component, OnInit } from '@angular/core';

import { Config } from './app.config';

import { ConfigService } from './services/config.service';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from './services/user.service';
import { User } from './models/user';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public config: Config;
  public alertMessage = '';
  public isAPIConected: boolean;
  public loading = true;
  public modules: any;
  public identity: User;

  constructor(
    public _configService: ConfigService,
    public _userService: UserService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _router: Router,
  ) {
    this.isAPIConected = true;
    this.validateIdentity();
  }

  ngOnInit(): void {
    this.setApiConfigurationSettings();
    this.getConfigApi();
  }

  public getConfigApi() {

    this.loading = true;

    this._configService.getConfigApi().subscribe(
      result => {
        if (!result.configs) {
          this.isAPIConected = false;
        } else {
          this.isAPIConected = true;
          const config = result.configs[0];
          this.setConfigurationSettings(config);
        }
        this.loading = false;
      },
      error => {
        this.isAPIConected = false;
      }
    );
  }

  public validateIdentity() {
    
    this.identity = this._userService.getIdentity();

    if(this.identity) {
      this._router.navigate(['/']);
    } else {
      this._router.navigate(['/login']);
    }
  }

  public setConfigurationSettings(config) {
    if (config.pathBackup) { Config.setConfigToBackup(config.pathBackup, config.pathMongo, config.backupTime); }
    if (config.emailAccount) { Config.setConfigEmail(config.emailAccount, config.emailPassword) }
    if (config.companyName) { Config.setConfigCompany(config.companyPicture, config.companyName, config.companyAddress, config.companyPhone,
                                                    config.companyVatCondition, config.companyStartOfActivity, config.companyGrossIncome, config.footerInvoice, config.companyFantasyName,
                                                    config.country, config.timezone, config.companyIdentificationType, config.companyIdentificationValue, config.licenseCost);
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
    Config.setApiHost(window.location.hostname);
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
