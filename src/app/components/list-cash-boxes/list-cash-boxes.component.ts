import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { CashBox } from './../../models/cash-box';
import { CashBoxService } from './../../services/cash-box.service';

import { AddCashBoxComponent } from './../../components/add-cash-box/add-cash-box.component';
import { DeleteCashBoxComponent } from './../../components/delete-cash-box/delete-cash-box.component';

@Component({
  selector: 'app-list-cash-boxes',
  templateUrl: './list-cash-boxes.component.html',
  styleUrls: ['./list-cash-boxes.component.css'],
  providers: [NgbAlertConfig]
})

export class ListCashBoxesComponent implements OnInit {

  public cashBoxes: CashBox[] = new Array();
  public areCashBoxesEmpty: boolean = true;
  public alertMessage: any;
  public userType: string;
  public orderTerm: string[] = ['code'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;

  constructor(
    public _cashBoxService: CashBoxService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCashBoxes();
  }

  public getBadge(term: string): boolean {

    return true;
  }

  public getCashBoxes(): void {  

    this._cashBoxService.getCashBoxes().subscribe(
        result => {
					if(!result.cashBoxes) {
						this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
					  this.cashBoxes = null;
            this.areCashBoxesEmpty = true;
					} else {
            this.alertMessage = null;
					  this.cashBoxes = result.cashBoxes;
            this.areCashBoxesEmpty = false;
          }
				},
				error => {
					this.alertMessage = error._body;
					if(!this.alertMessage) {
						this.alertMessage = "Error en la petición.";
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
  
  public openModal(op: string, cashBox:CashBox): void {

      let modalRef;
      switch(op) {
        case 'add' :
          modalRef = this._modalService.open(AddCashBoxComponent, { size: 'lg' }).result.then((result) => {
            this.getCashBoxes();
          }, (reason) => {
            this.getCashBoxes();
          });
          break;
        case 'delete' :
            modalRef = this._modalService.open(DeleteCashBoxComponent, { size: 'lg' })
            modalRef.componentInstance.cashBox = cashBox;
            modalRef.result.then((result) => {
              if(result === 'delete_close') {
                this.getCashBoxes();
              }
            }, (reason) => {
              
            });
          break;
        default : ;
      }
    };
}