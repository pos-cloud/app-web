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
    this.loading = true;
    this.getConfigLocal();
  }

  public getConfigLocal() {
    
    let result = this._configService.getConfigLocal();
    if (!result) {
      this.openModal("config");
      this.isAPIConected = false;
    } else {
      this.config = result.config;
      this.setConfigurationSettings(this.config);
      this.hideMessage();
      this.getConfigApi();
    }
  }

  public getConfigApi() {
    
    this._configService.getConfigApi().subscribe(
      result => {
        if (!result) {
          this.openModal("config");
          this.isAPIConected = false;
        } else {
          this.hideMessage();
          this.isAPIConected = true;
        }
      },
      error => {
        this.isAPIConected = false;
        this.openModal('config');
      }
    );
  }

  public setConfigurationSettings(config) {
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
