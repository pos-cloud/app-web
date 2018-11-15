import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { CompanyService } from './../../services/company.service';
import { CompanyType } from '../../models/company';

@Component({
  selector: 'app-list-summary-of-accounts',
  templateUrl: './list-summary-of-accounts.component.html',
  styleUrls: ['./list-summary-of-accounts.component.css']
})

export class ListSummaryOfAccountsComponent implements OnInit {

  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public items: any[] = new Array();
  public areItemsEmpty: boolean = false;
  public areFiltersVisible: boolean = false;
  public orderTerm: string[] = ['balance'];
  public propertyTerm: string;
  public itemsPerPage = 10;
  public totalItems = 0;
  public filterType: CompanyType;
  public startDate: string;
  public endDate: string;

  constructor(
    public _companyService: CompanyService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.startDate = moment('1990-01-01').format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
  }

  ngOnInit(): void {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if (!this.filterType) {
      if (pathLocation[3] === "cliente") {
        this.filterType = CompanyType.Client;
        this.orderTerm = ['balance'];
      } else if (pathLocation[3] === "proveedor") {
        this.filterType = CompanyType.Provider;
        this.orderTerm = ['-balance'];
      }
    }
    this.getSummary();
  }

  public getSummary(): void {

    this.loading = true;

    let query = {
      startDate: this.startDate,
      endDate: this.endDate
    }

    this._companyService.getSummaryOfAccounts(JSON.stringify(query)).subscribe(
        result => {
          if (!result) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.items = null;
            this.totalItems = 0;
          } else {
            this.hideMessage();
            this.items = result;
            this.totalItems = this.items.length;
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  public viewDetailCureentAccount(companyId: string): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this._router.navigate(['/admin/cuentas-corrientes/' + pathLocation[3] + '/' + companyId]);
  };

  public refresh(): void {
    this.getSummary();
  }

  public orderBy(term: string, property?: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
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
