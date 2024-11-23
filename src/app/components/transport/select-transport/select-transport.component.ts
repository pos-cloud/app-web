import { Component, EventEmitter, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';

import {
  NgbActiveModal,
  NgbAlertConfig,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

import { Transport } from 'app/components/transport/transport';
import { AuthService } from 'app/core/services/auth.service';
import { TransportService } from 'app/core/services/transport.service';

@Component({
  selector: 'app-select-transport',
  templateUrl: './select-transport.component.html',
  styleUrls: ['./select-transport.component.css'],
})
export class SelectTransportComponent implements OnInit {
  public transports: Transport[] = new Array();
  public transportSelected: Transport;
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public declaredValue: number;
  public package: number;

  constructor(
    public _fb: UntypedFormBuilder,
    public _transportService: TransportService,
    public _authService: AuthService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {}

  async ngOnInit() {
    this.transportSelected = new Transport();
    await this.getTransports().then((transports) => {
      if (transports && transports.length > 0) {
        this.transports = transports;
        this.transportSelected = this.transports[0];
      }
    });
  }

  public getTransports(): Promise<Transport[]> {
    return new Promise<Transport[]>((resolve, reject) => {
      let match = { operationType: { $ne: 'D' } };

      this._transportService
        .getTransports(
          {}, // PROJECT
          match, // MATCH
          { name: 1 }, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
        )
        .subscribe(
          (result) => {
            if (result.transports) {
              resolve(result.transports);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          }
        );
    });
  }

  public selectTransport(): void {
    this.activeModal.close({
      transport: this.transportSelected,
      declaredValue: this.declaredValue,
      package: this.package,
    });
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
