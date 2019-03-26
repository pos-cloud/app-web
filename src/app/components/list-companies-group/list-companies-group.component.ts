import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { CompanyGroup } from "./../../models/company-group";

import { CompanyGroupService } from "./../../services/company-group.service";

import { AddCompanyGroupComponent } from "./../../components/add-company-group/add-company-group.component";
import { UpdateCompanyGroupComponent } from "./../../components/update-company-group/update-company-group.component";
import { DeleteCompanyGroupComponent } from "./../../components/delete-company-group/delete-company-group.component";

@Component({
  selector: 'app-list-companies-group',
  templateUrl: './list-companies-group.component.html',
  styleUrls: ['./list-companies-group.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})
export class ListCompaniesGroupComponent implements OnInit {

  public companiesGroup: CompanyGroup[] = new Array();
  public areCompanyGroupEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<CompanyGroup> = new EventEmitter<CompanyGroup>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _companyGroupService: CompanyGroupService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCompaniesGroup();
  }

  public getCompaniesGroup(): void {

    this.loading = true;

    this._companyGroupService.getCompaniesGroup().subscribe(
        result => {
          if (!result.companiesGroup) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
            this.companiesGroup = null;
            this.areCompanyGroupEmpty = true;
          } else {
            this.hideMessage();
            this.loading = false;
            this.companiesGroup = result.companiesGroup;
            this.totalItems = this.companiesGroup.length;
            this.areCompanyGroupEmpty = false;
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
   }

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getCompaniesGroup();
  }

  public openModal(op: string, companyGroup:CompanyGroup): void {

    let modalRef;
    switch(op) {
      case 'view' :
          modalRef = this._modalService.open(UpdateCompanyGroupComponent, { size: 'lg' });
          modalRef.componentInstance.companyGroup = companyGroup;
          modalRef.componentInstance.readonly = true;
        break;
      case 'add' :
        modalRef = this._modalService.open(AddCompanyGroupComponent, { size: 'lg' }).result.then((result) => {
          this.getCompaniesGroup();
        }, (reason) => {
          this.getCompaniesGroup();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(UpdateCompanyGroupComponent, { size: 'lg' });
          modalRef.componentInstance.companyGroup = companyGroup;
          modalRef.componentInstance.readonly = false;
          modalRef.result.then((result) => {
            if (result === 'save_close') {
              this.getCompaniesGroup();
            }
          }, (reason) => {

          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(DeleteCompanyGroupComponent, { size: 'lg' })
          modalRef.componentInstance.companyGroup = companyGroup;
          modalRef.result.then((result) => {
            if (result === 'delete_close') {
              this.getCompaniesGroup();
            }
          }, (reason) => {

          });
        break;
      default : ;
    }
  };

  public addItem(companyGroupSelected) {
    this.eventAddItem.emit(companyGroupSelected);
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
