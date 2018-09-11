import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { CashBox } from './../../models/cash-box';
import { CashBoxService } from './../../services/cash-box.service';

import { PrintComponent } from './../../components/print/print.component';

@Component({
  selector: 'app-list-cash-boxes',
  templateUrl: './list-cash-boxes.component.html',
  styleUrls: ['./list-cash-boxes.component.css'],
  providers: [NgbAlertConfig]
})

export class ListCashBoxesComponent implements OnInit {

  public cashBoxes: CashBox[] = new Array();
  public areCashBoxesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['-openingDate'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _cashBoxService: CashBoxService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCashBoxes();
  }

  public getBadge(term: string): boolean {

    return true;
  }

  public getCashBoxes(): void {  

    this.loading = true;

    this._cashBoxService.getCashBoxes().subscribe(
        result => {
					if (!result.cashBoxes) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
					  this.cashBoxes = null;
            this.areCashBoxesEmpty = true;
					} else {
            this.hideMessage();
            this.cashBoxes = result.cashBoxes;
            this.totalItems = this.cashBoxes.length;
            this.areCashBoxesEmpty = false;
          }
          this.loading = false;
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
    this.getCashBoxes();
  }
  
  public openModal(op: string, cashBox: CashBox): void {

    let modalRef;
    switch (op) {
      case 'print':
        let modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.cashBox = cashBox;
        modalRef.componentInstance.typePrint = 'cash-box';
        modalRef.result.then((result) => {

        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}