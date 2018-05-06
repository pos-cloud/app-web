import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Variant } from './../../models/variant';

import { VariantService } from './../../services/variant.service';

@Component({
  selector: 'app-delete-variant',
  templateUrl: './delete-variant.component.html',
  styleUrls: ['./delete-variant.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteVariantComponent implements OnInit {

  @Input() variant: Variant;
  public alertMessage: string = "";
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _variantService: VariantService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteVariant(): void {

    this.loading = true;

    this._variantService.deleteVariant(this.variant._id).subscribe(
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