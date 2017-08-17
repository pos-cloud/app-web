import { Component } from '@angular/core';

import { Config } from './app.config';

import { ConfigService } from './services/config.service';

import { ConfigComponent } from './components/config/config.component';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public config: Config;
  public alertMessage: any;
  public isAPIConected: boolean;

  constructor(
    public _configService: ConfigService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {

    this.isAPIConected = false;
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
      this.alertMessage = null;
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
          this.alertMessage = null;
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
    // Config.setPrintHost(config.printHost);
    // Config.setPrintPort(config.printPort);
  }

  public openModal(op: string): void {

    let modalRef;
    switch (op) {
      case 'config':

        modalRef = this._modalService.open(ConfigComponent, { size: 'lg' }).result.then((result) => {
          if (result === 'save_close') {
            this.alertMessage = null;
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
}
