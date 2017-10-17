import { Component, OnInit } from '@angular/core';

import { Config } from './app.config';

import { ConfigService } from './services/config.service';

import { ConfigComponent } from './components/config/config.component';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  public config: Config;
  public alertMessage: string = "";
  public isAPIConected: boolean;
  public loading: boolean = true;

  constructor(
    public _configService: ConfigService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {
    this.isAPIConected = false;
  }

  ngOnInit(): void {
    this.getConfigLocal();
  }

  public getConfigLocal() {

    this.loading = true;

    let result = this._configService.getConfigLocal();
    if (!result) {
      this.openModal("config");
      this.isAPIConected = false;
      this.loading = false;
    } else {
        this.config = result.config[0];
        this.setConfigurationSettings(this.config);
        this.setApiConfigurationSettings(this.config);
        this.hideMessage();
        this.getConfigApi();
        this.loading = false;
    }
  }

  public getConfigApi() {

    this.loading = true;

    this._configService.getConfigApi().subscribe(
      result => {
        if (!result) {
          this.openModal("config");
          this.isAPIConected = false;
          this.loading = false;
        } else {
          this.hideMessage();
          this.isAPIConected = true; 
          let config = result.config[0];
          this.setConfigurationSettings(config);
          this.setApiConfigurationSettings(config);
          this.loading = false;
        }
      },
      error => {
        this.isAPIConected = false;
        this.openModal('config');
      }
    );
  }

  public setConfigurationSettings(config) {
    if(!config.pathBackup) Config.setConfigToBackup(config.pathBackup, config.pathMongo, config.backupTime);
    if(!config.emailAccount) Config.setConfigEmail(config.emailAccount, config.emailPassword)
    if(!config.nameCompany) Config.setConfigCompany(config.nameCompany, config.cuitCompany, config.addressCompany, config.phoneCompany, config.footerTicket);
  }

  public setApiConfigurationSettings(config) {
    Config.setApiHost(config.apiHost);
    Config.setApiPort(config.apiPort);
  }

  public openModal(op: string): void {

    let modalRef;
    switch (op) {
      case 'config':

        modalRef = this._modalService.open(ConfigComponent, { size: 'lg' }).result.then((result) => {
          if (result === 'save_close') {
            this.hideMessage();
            this.isAPIConected = true;
          } else {
            this.getConfigApi();
          }
        }, (reason) => {
          this.getConfigApi();
        });
        break;
      default: ;
    }
  };
  
  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = "";
  }
}
