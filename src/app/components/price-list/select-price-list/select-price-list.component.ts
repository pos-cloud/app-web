import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from 'app/components/login/auth.service';
import { Transport } from 'app/components/transport/transport';
import { TransportService } from 'app/components/transport/transport.service';
import { PriceList } from '../price-list';
import { PriceListService } from '../price-list.service';

@Component({
  selector: 'app-select-price-list',
  templateUrl: './select-price-list.component.html',
  styleUrls: ['./select-price-list.component.css']
})
export class SelectPriceListComponent implements OnInit {

  public priceLists: PriceList[] = new Array();
  public priceListSelected: PriceList;
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public _fb: UntypedFormBuilder,
    public _priceListService: PriceListService,
    public _authService: AuthService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
  ) { }

  async ngOnInit() {
    
    this.priceListSelected = new PriceList();
    await this.getPriceLists().then(
      result => {
          if(result){
              this.priceLists = result;
          }
      }
    );
  }

  public getPriceLists(): Promise<PriceList[]> {

    return new Promise<PriceList[]>((resolve, reject) => {

      let match = { operationType: { $ne: 'D' } };
  
      this._priceListService.getAll({
          match : match,// SKIP
      }).subscribe(
        result => {
          if(result.status === 200){
              resolve(result.result)
          } else {
            this.showMessage(result.message, 'danger', false);
        }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public selectPriceList(): void {
    this.activeModal.close({ priceList: this.priceListSelected });
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
