import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { CompanyService } from './../../services/company.service';


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

  constructor(
    public _companyService: CompanyService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getSummary();

  }

  public getSummary() : void {
    
    this.loading = true;
    
    this._companyService.getSummaryOfAccounts().subscribe(
        result => {
          if (!result) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
            this.loading = false;
            this.items = null;
            this.areItemsEmpty = true;
          } else {
            this.hideMessage();
            this.loading = false;
            this.items = result;
            this.areItemsEmpty = false;
          }
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
