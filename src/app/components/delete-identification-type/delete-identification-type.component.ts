import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IdentificationType } from './../../models/identification-type';

import { IdentificationTypeService } from './../../services/identification-type.service';

@Component({
  selector: 'app-delete-identification-type',
  templateUrl: './delete-identification-type.component.html',
  styleUrls: ['./delete-identification-type.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteIdentificationTypeComponent implements OnInit {

  @Input() identificationType: IdentificationType;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _identificationTypeService: IdentificationTypeService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteIdentificationType(): void {

    this.loading = true;

    this._identificationTypeService.deleteIdentificationType(this.identificationType._id).subscribe(
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

  public hideMessage():void {
    this.alertMessage = '';
  }
}
