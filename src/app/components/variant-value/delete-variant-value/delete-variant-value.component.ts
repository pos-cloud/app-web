import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { VariantValue } from '../variant-value';

import { VariantValueService } from '../variant-value.service';

@Component({
  selector: 'app-delete-variant-value',
  templateUrl: './delete-variant-value.component.html',
  styleUrls: ['./delete-variant-value.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteVariantValueComponent implements OnInit {

  @Input() variantValue: VariantValue;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _variantValueService: VariantValueService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteVariantValue(): void {

    this.loading = true;

    this._variantValueService.deleteVariantValue(this.variantValue._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
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
    this.alertMessage = '';
  }
}