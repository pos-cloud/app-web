import { Component, EventEmitter, Input, OnInit } from '@angular/core';

import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { VariantType } from '../variant-type';

import { VariantTypeService } from '../../../core/services/variant-type.service';

@Component({
  selector: 'app-delete-variant-type',
  templateUrl: './delete-variant-type.component.html',
  styleUrls: ['./delete-variant-type.component.css'],
  providers: [NgbAlertConfig],
})
export class DeleteVariantTypeComponent implements OnInit {
  @Input() variantType: VariantType;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _variantTypeService: VariantTypeService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteVariantType(): void {
    this.loading = true;

    this._variantTypeService.deleteVariantType(this.variantType._id).subscribe(
      (result) => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
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
