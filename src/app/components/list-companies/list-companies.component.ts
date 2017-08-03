import { Component, OnInit, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Company } from './../../models/company';
import { CompanyService } from './../../services/company.service';

import { AddCompanyComponent } from './../../components/add-company/add-company.component';
import { UpdateCompanyComponent } from './../../components/update-company/update-company.component';
import { DeleteCompanyComponent } from './../../components/delete-company/delete-company.component';

@Component({
  selector: 'app-list-companies',
  templateUrl: './list-companies.component.html',
  styleUrls: ['./list-companies.component.css'],
  providers: [NgbAlertConfig]
})

export class ListCompaniesComponent implements OnInit {

  public companies: Company[] = new Array();
  public areCompaniesEmpty: boolean = true;
  public alertMessage: any;
  @Input() userType: string;
  public orderTerm: string[] = ['code'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;

  constructor(
    public _companyService: CompanyService,
    public _router: Router,
    public _modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCompanies();
  }

  public getBadge(term: string): boolean {

    return true;
  }

  public getCompanies(): void {  

    this._companyService.getCompanies().subscribe(
        result => {
					if(!result.companies) {
						this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
					  this.companies = null;
            this.areCompaniesEmpty = true;
					} else {
            this.alertMessage = null;
					  this.companies = result.companies;
            this.areCompaniesEmpty = false;
          }
				},
				error => {
					this.alertMessage = error._body;
					if(!this.alertMessage) {
						this.alertMessage = "Ha ocurrido un error en el servidor";
					}
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
      case 'add' :
        modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg' }).result.then((result) => {
          this.getCompanies();
        }, (reason) => {
          this.getCompanies();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(UpdateCompanyComponent, { size: 'lg' })
          modalRef.componentInstance.company = company;
          modalRef.result.then((result) => {
            if(result === 'save_close') {
              this.getCompanies();
            }
          }, (reason) => {
            
          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(DeleteCompanyComponent, { size: 'lg' })
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
  
  public selectCompany(companySelected: Company): void {
    this.activeModal.close(companySelected);
  }
}