import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CashBox } from './../../models/cash-box';

import { CashBoxService } from './../../services/cash-box.service';

@Component({
  selector: 'app-delete-cash-box',
  templateUrl: './delete-cash-box.component.html',
  styleUrls: ['./delete-cash-box.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteCashBoxComponent implements OnInit {

  @Input() cashBox: CashBox;
  public alertMessage: string = "";
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _cashBoxService: CashBoxService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteCashBox(): void {

    this.loading = true;
    
    this._cashBoxService.deleteCashBox(this.cashBox._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }
  
    public showMessage(message: string, type: string, dismissible: boolean): void {
      this.alertMessage = message;
      this.alertConfig.type = type;
      this.alertConfig.dismissible = dismissible;
    }
  
    public hideMessage():void {
      this.alertMessage = "";
    }
}
