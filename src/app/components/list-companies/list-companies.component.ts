import { Component, OnInit, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Company } from './../../models/company';
import { Config } from './../../app.config';

import { CompanyService } from './../../services/company.service';

import { AddCompanyComponent } from './../../components/add-company/add-company.component';
import { UpdateCompanyComponent } from './../../components/update-company/update-company.component';
import { DeleteCompanyComponent } from './../../components/delete-company/delete-company.component';
import { SendMailComponent } from './../../components/send-mail/send-mail.component';

@Component({
  selector: 'app-list-companies',
  templateUrl: './list-companies.component.html',
  styleUrls: ['./list-companies.component.css'],
  providers: [NgbAlertConfig]
})

export class ListCompaniesComponent implements OnInit {

  public companies: Company[];
  public areCompaniesEmpty: boolean = true;
  public alertMessage: string = "";
  @Input() userType: string;
  public orderTerm: string[] = ['code'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _companyService: CompanyService,
    public _router: Router,
    public _modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    this.companies = new Array();
  }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    if(!this.userType) {
      this.userType = pathLocation[1];
    }
    this.getCompanies();
  }

  public getCompanies(): void {  

    this.loading = true;

    this._companyService.getCompanies().subscribe(
        result => {
					if(!result.companies) {
            this.showMessage(result.message, "info", true); 
            this.loading = false;
					  this.companies = null;
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
          this.showMessage(error._body, "danger", false);
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
    this.getCompanies();
  }
  
  public openModal(op: string, company:Company): void {

    let modalRef;
    switch(op) {
      case 'view' :
          modalRef = this._modalService.open(UpdateCompanyComponent, { size: 'lg' });
          modalRef.componentInstance.company = company;
          modalRef.componentInstance.readonly = true;
        break;
      case 'add' :
        modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg' }).result.then((result) => {
          this.getCompanies();
        }, (reason) => {
          this.getCompanies();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(UpdateCompanyComponent, { size: 'lg' });
          modalRef.componentInstance.company = company;
          modalRef.componentInstance.readonly = false;
          modalRef.result.then((result) => {
            if(result === 'save_close') {
              this.getCompanies();
            }
          }, (reason) => {
            
          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(DeleteCompanyComponent, { size: 'lg' });
          modalRef.componentInstance.company = company;
          modalRef.result.then((result) => {
            if(result === 'delete_close') {
              this.getCompanies();
            }
          }, (reason) => {
            
          });
        break;
      default : ;
    }
  };

  public openMail(): void {
    
    if(Config.emailAccount) {
      if(this.companies.length !== 0) {
        let modalRef;
        let emails = "";
  
        modalRef = this._modalService.open(SendMailComponent, { size: 'lg' });
        for(let i=0; i < this.companies.length; i++){
          emails += this.companies[i].emails;
          if((i-this.companies.length)<=-2){
            emails += ",";
          }
        }
        modalRef.componentInstance.emails = emails;
        modalRef.result.then((result) => {
        }, (reason) => {
        });
      } else {
        this.showMessage("No se encontraron empresas.","info",true);
      }
    } else {
      this.showMessage("Debe primero configurar la cuenta de correo.", "info", true);
    }
  }
  
  public selectCompany(companySelected: Company): void {
    this.activeModal.close(companySelected);
  }
  
  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = "";
  }
}