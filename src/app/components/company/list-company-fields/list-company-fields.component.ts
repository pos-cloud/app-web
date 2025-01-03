import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CompanyFieldService } from '../../../core/services/company-field.service';
import { CompanyField } from '../../company-field/company-field';

import { AddCompanyFieldComponent } from '../../company-field/add-company-field.component';
import { DeleteCompanyFieldComponent } from '../../company-field/delete-company-field/delete-company-field.component';
import { UpdateCompanyFieldComponent } from '../../company-field/update-company-field/update-company-field.component';

@Component({
  selector: 'app-list-company-fields',
  templateUrl: './list-company-fields.component.html',
  styleUrls: ['./list-company-fields.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class ListCompanyFieldsComponent implements OnInit {
  public companyFields: CompanyField[] = new Array();
  public areCompanyFieldsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<CompanyField> =
    new EventEmitter<CompanyField>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _companyFieldService: CompanyFieldService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {}

  ngOnInit(): void {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCompanyFields();
  }

  public getCompanyFields(): void {
    this.loading = true;

    this._companyFieldService.getCompanyFields().subscribe(
      (result) => {
        if (!result.companyFields) {
          if (result.message && result.message !== '')
            this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.companyFields = new Array();
          this.areCompanyFieldsEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.companyFields = result.companyFields;
          this.totalItems = this.companyFields.length;
          this.areCompanyFieldsEmpty = false;
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy(term: string, property?: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getCompanyFields();
  }

  public openModal(op: string, companyField: CompanyField): void {
    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(UpdateCompanyFieldComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.companyField = companyField;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add':
        modalRef = this._modalService
          .open(AddCompanyFieldComponent, { size: 'lg', backdrop: 'static' })
          .result.then(
            (result) => {
              this.getCompanyFields();
            },
            (reason) => {
              this.getCompanyFields();
            }
          );
        break;
      case 'update':
        modalRef = this._modalService.open(UpdateCompanyFieldComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.companyField = companyField;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then(
          (result) => {
            if (result === 'save_close') {
              this.getCompanyFields();
            }
          },
          (reason) => {}
        );
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteCompanyFieldComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.companyField = companyField;
        modalRef.result.then(
          (result) => {
            if (result === 'delete_close') {
              this.getCompanyFields();
            }
          },
          (reason) => {}
        );
        break;
      default:
    }
  }

  public addItem(companyFieldSelected) {
    this.eventAddItem.emit(companyFieldSelected);
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
