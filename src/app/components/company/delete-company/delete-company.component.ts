import { Component, EventEmitter, Input, OnInit } from '@angular/core';

import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Company } from '../company';

import { CompanyService } from '../../../core/services/company.service';

@Component({
  selector: 'app-delete-company',
  templateUrl: './delete-company.component.html',
  styleUrls: ['./delete-company.component.css'],
  providers: [NgbAlertConfig],
})
export class DeleteCompanyComponent implements OnInit {
  @Input() company: Company;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _companyService: CompanyService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteCompany(): void {
    this.loading = true;

    this._companyService.deleteCompany(this.company._id).subscribe(
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
