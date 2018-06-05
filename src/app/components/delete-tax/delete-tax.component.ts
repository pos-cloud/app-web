import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Tax } from './../../models/tax';

import { TaxService } from './../../services/tax.service';

@Component({
  selector: 'app-delete-tax',
  templateUrl: './delete-tax.component.html',
  styleUrls: ['./delete-tax.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteTaxComponent implements OnInit {

  @Input() tax: Tax;
  public alertMessage: string = "";
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _taxService: TaxService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteTax(): void {

    this.loading = true;

    this._taxService.deleteTax(this.tax._id).subscribe(
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

  public hideMessage(): void {
    this.alertMessage = "";
  }
}