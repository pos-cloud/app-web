import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Company, CompanyType } from './../../models/company';
import { Config } from './../../app.config';

import { CompanyService } from './../../services/company.service';

import { AddCompanyComponent } from './../../components/add-company/add-company.component';
import { DeleteCompanyComponent } from './../../components/delete-company/delete-company.component';
import { SendEmailComponent } from './../../components/send-email/send-email.component';
import { ImportComponent } from '../import/import.component';
import { User } from 'app/models/user';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-list-companies',
  templateUrl: './list-companies.component.html',
  styleUrls: ['./list-companies.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListCompaniesComponent implements OnInit {

  public identity: User;
  public companies: Company[];
  @Input() type: CompanyType;
  public areCompaniesEmpty: boolean = true;
  public alertMessage: string = '';
  @Input() userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public userCountry: string;

  constructor(
    public _companyService: CompanyService,
    public _router: Router,
    public _modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _authService: AuthService
  ) {
    this.companies = new Array();
  }

  ngOnInit(): void {

    this._authService.getIdentity.subscribe(
      identity => {
        this.identity = identity;
      }
    );
    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');

    if (!this.userType) {
      this.userType = pathLocation[1];
    }
    this.getCompaniesByType();
  }

  public getCompaniesByType(): void {

    this.loading = true;

    let pathLocation: string[] = this._router.url.split('/');

    if (!this.type) {
      if (pathLocation[2] === "clientes") {
        this.type = CompanyType.Client;
      } else if (pathLocation[2] === "proveedores") {
        this.type = CompanyType.Provider;
      }
    }

    let query = 'where="type":"' + this.type.toString() + '"';

    this._companyService.getCompanies(query).subscribe(
        result => {
					if (!result.companies) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
					  this.companies = new Array();
            this.areCompaniesEmpty = true;
					} else {
            this.hideMessage();
            this.loading = false;
            this.companies = result.companies;
            this.totalItems = this.companies.length;
            this.areCompaniesEmpty = false;
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
    this.getCompaniesByType();
  }

  public openModal(op: string, company:Company): void {

    let modalRef;
    switch(op) {
      case 'view' :
          modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg' });
          modalRef.componentInstance.companyId = company._id;
          modalRef.componentInstance.readonly = true;
          modalRef.componentInstance.operation = 'view';
        break;
      case 'add' :
        modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg' });
        modalRef.componentInstance.operation = 'add';
        modalRef.componentInstance.companyType = this.type;
        modalRef.result.then((result) => {
          if(this.userType === 'pos') {
            this.selectCompany(result.company);
          } else {
            this.getCompaniesByType();
          }
        }, (reason) => {
          this.getCompaniesByType();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg' });
          modalRef.componentInstance.companyId = company._id;
          modalRef.componentInstance.readonly = false;
          modalRef.componentInstance.operation = 'update';
          modalRef.result.then((result) => {
            this.getCompaniesByType();
          }, (reason) => {
              this.getCompaniesByType();
          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(DeleteCompanyComponent, { size: 'lg' });
          modalRef.componentInstance.company = company;
          modalRef.result.then((result) => {
            if (result === 'delete_close') {
              this.getCompaniesByType();
            }
          }, (reason) => {

          });
        break;
      case 'import':
        modalRef = this._modalService.open(ImportComponent, { size: 'lg' });
        let model: any = new Company();
        model.model = "company";
        model.primaryKey = "code";
        model.code = '';
        model.name = '';
        model.fantasyName = '';
        model.type = '';
        model.relations = new Array();
        model.relations.push("vat-condition_relation_description");
        model.relations.push("identification-type_relation_name");
        model.relations.push("state_relation_name");
        model.identificationValue = '';
        model.address = '';
        model.city = '';
        model.phones = '';
        model.emails = '';
        model.birthday = '';
        model.observation = '';
        model.addressNumber = '';
        model.gender = '';
        model.grossIncome = '';
        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          if (result === 'import_close') {
            this.getCompaniesByType();
          }
        }, (reason) => {

        });
        break;
      default : ;
    }
  };

  public openEmail(): void {

    if (Config.emailAccount) {
      if (this.companies && this.companies.length !== 0) {
        let modalRef;
        let emails = '';

        modalRef = this._modalService.open(SendEmailComponent, { size: 'lg' });
        if(this.companies && this.companies.length > 0) {
          for(let i=0; i < this.companies.length; i++){
            emails += this.companies[i].emails;
            if ((i-this.companies.length)<=-2){
              emails += ",";
            }
          }
        }
        modalRef.componentInstance.emails = emails;
        modalRef.result.then((result) => {
        }, (reason) => {
        });
      } else {
        this.showMessage("No se encontraron empresas.",'info',true);
      }
    } else {
      this.showMessage("Debe primero configurar la cuenta de correo.", 'info', true);
    }
  }

  public selectCompany(companySelected: Company): void {
    this.activeModal.close({ company: companySelected });
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }

  exportAsXLSX():void {

    let data = [] ;

    for (let index = 0; index < this.companies.length; index++) {

      data[index] = {};
      data[index]['Nombre'] = this.companies[index].name;
      data[index]['Nombre de Fantasía'] = this.companies[index].fantasyName;

      if (this.companies[index].vatCondition) {
        data[index]['CondiciónDeIVA'] = this.companies[index].vatCondition.description;
      } else {
        data[index]['CondiciónDeIVA'] = 'Consumidor Final';
      }
      data[index]['Identificador'] = this.companies[index].identificationValue;
      data[index]['Teléfono'] = this.companies[index].phones;
      data[index]['Dirección'] = this.companies[index].address;
      data[index]['Ciudad'] = this.companies[index].city;
      data[index]['Cumpleaños'] = this.companies[index].birthday;
      data[index]['Género'] = this.companies[index].gender;
      data[index]['Observación'] = this.companies[index].observation;

      if (this.companies[index].group) {
        data[index]['Grupo'] = this.companies[index].group.description;
      } else {
        data[index]['Grupo'] = '';
      }
    }
    this._companyService.exportAsExcelFile(data, this.type.toString());
 }

}
