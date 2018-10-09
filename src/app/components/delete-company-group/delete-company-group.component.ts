import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CompanyGroup } from './../../models/company-group';

import { CompanyGroupService } from './../../services/company-group.service';

@Component({
  selector: 'app-delete-company-group',
  templateUrl: './delete-company-group.component.html',
  styleUrls: ['./delete-company-group.component.css'],
  providers: [NgbAlertConfig]
})
export class DeleteCompanyGroupComponent implements OnInit {

  @Input() companyGroup: CompanyGroup;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _companyGroupService: CompanyGroupService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteCompanyGroup(): void {

    this.loading = true;

    this._companyGroupService.deleteCompanyGroup(this.companyGroup._id).subscribe(
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
