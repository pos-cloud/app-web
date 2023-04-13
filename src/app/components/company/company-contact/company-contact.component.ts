import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { CompanyContact } from '../company-contact';
import { Company } from '../company';
import { CompanyContactService } from '../company-contact.service';

@Component({
  selector: 'app-company-contact',
  templateUrl: './company-contact.component.html',
  styleUrls: ['./company-contact.component.css'],
  providers: [NgbAlertConfig]
})

export class CompanyContactComponent implements OnInit {

  public companiesContacts: CompanyContact[] = new Array();
  public companyContact: CompanyContact;
  public areCompaniesContactEmpty: boolean = true;
  @Input() company: Company;
  
  public contactForm: UntypedFormGroup;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['-date'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 5;
  public totalItems = 0;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': ''
  };

  public validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _companyContactService: CompanyContactService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { 
    this.companyContact =  new CompanyContact();
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCompaniesContacts();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getCompaniesContacts(): void {

    this.loading = true;

    let query: string = 'where="company":"' + this.company._id + '"';

    this._companyContactService.getCompaniesContacts(query).subscribe(
      result => {
        if (!result.companiesContacts) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.companiesContacts = [];
          this.areCompaniesContactEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.companiesContacts = result.companiesContacts;
          this.totalItems = this.companiesContacts.length;
          this.areCompaniesContactEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy(term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getCompaniesContacts();
  }

  public addCompanyContact(): void {

    if ( this.companyContact.name !== '') {
      this.companyContact.company = this.company;
      this.saveCompanyContact();
    } else {
      this.showMessage("Debe completar el contacto", 'info', true);
    }
  }

  public saveCompanyContact(): void {
    
    this.loading = true;

    this._companyContactService.saveCompanyContact(this.companyContact).subscribe(
      result => {
        if (!result.companyContact) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.companyContact = result.companyContact;
          this.companyContact = new CompanyContact();
          this.focusEvent.emit(true);
          this.getCompaniesContacts();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteCompanyContact(companyContact: CompanyContact): void {

    this.loading = true;

    this._companyContactService.deleteCompanyContact(companyContact._id).subscribe(
      result => {
        if (!result.companyContact) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.getCompaniesContacts();
        }
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

  public hideMessage(): void {
    this.alertMessage = '';
  }

}
