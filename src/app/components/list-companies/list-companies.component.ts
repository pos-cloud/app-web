import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Company } from './../../models/company';
import { CompanyService } from './../../services/company.service';

import { AddCompanyComponent } from './../../components/add-company/add-company.component';
import { UpdateCompanyComponent } from './../../components/update-company/update-company.component';
import { DeleteCompanyComponent } from './../../components/delete-company/delete-company.component';

@Component({
  selector: 'app-list-companies',
  templateUrl: './list-companies.component.html',
  styleUrls: ['./list-companies.component.css']
})

export class ListCompaniesComponent implements OnInit {

  private companies: Company[] = new Array();
  private areCompaniesEmpty: boolean = true;
  private alertMessage: any;
  private userType: string;
  private orderTerm: string[] = ['name'];
  private propertyTerm: string;
  private areFiltersVisible: boolean = false;

  constructor(
    private _companyService: CompanyService,
    private _router: Router,
    private _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    
    this._router.events.subscribe((data:any) => { 
      let pathLocation: string;
      pathLocation = data.url.split('/');
      this.userType = pathLocation[1];
    });
    console.log("entro");
    this.getCompanies();
  }

  private getBadge(term: string): boolean {

    return true;
  }

  private getCompanies(): void {  

    console.log("entro2");
    this._companyService.getCompanies().subscribe(
        result => {
					if(!result.companies) {
          console.log("error" +result.message);
						this.alertMessage = result.message;
					  this.companies = null;
            this.areCompaniesEmpty = true;
					} else {
            this.alertMessage = null;
					  this.companies = result.companies;
            console.log(this.companies);
            this.areCompaniesEmpty = false;
          }
				},
				error => {
					this.alertMessage = error;
					if(!this.alertMessage) {
						this.alertMessage = "Error en la petición.";
					}
				}
      );
   }

  private orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
    this.propertyTerm = property;
  }
  
  private openModal(op: string, company:Company): void {

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
}