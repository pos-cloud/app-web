import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CompanyField } from '../company-field';

import { CompanyFieldService } from '../company-field.service';

@Component({
  selector: 'app-delete-company-field',
  templateUrl: './delete-company-field.component.html',
  styleUrls: ['./delete-company-field.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteCompanyFieldComponent implements OnInit {

  @Input() companyField: CompanyField;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _companyFieldService: CompanyFieldService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteCompanyField(): void {

    this.loading = true;

    this._companyFieldService.deleteCompanyField(this.companyField._id).subscribe(
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