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

  public alertMessage: any;
  public isAPIConected: boolean;

  constructor(
    public _configService: ConfigService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {

    this.isAPIConected = false;
    this.getConfig();
  }

  public getConfig() {
    this._configService.getConfig().subscribe(
      result => {
        console.log(result);
        if(!result.config) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
          this.isAPIConected = true;
        } else {
          this.alertMessage = null;
          this.isAPIConected = true;
          Config.setApiHost(result.config.apiHost);
          Config.setApiPort(result.config.apiPort);
          Config.setPrintHost(result.config.printHost);
          Config.setPrintPort(result.config.printPort);
        }
      },
      error => {
        this.isAPIConected = false;
        this.openModal('config');
      }
    );
  }

  public openModal(op: string): void {

    let modalRef;
    switch (op) {
      case 'config':

        modalRef = this._modalService.open(ConfigComponent, { size: 'lg' }).result.then((result) => {
          this.getConfig();
        }, (reason) => {
          this.getConfig();
        });
        break;
      default: ;
    }
  };
}
