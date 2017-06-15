import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CashBox } from './../../models/cash-box';
import { CashBoxService } from './../../services/cash-box.service';

import { AddCashBoxComponent } from './../../components/add-cash-box/add-cash-box.component';
import { DeleteCashBoxComponent } from './../../components/delete-cash-box/delete-cash-box.component';

@Component({
  selector: 'app-list-cash-boxes',
  templateUrl: './list-cash-boxes.component.html',
  styleUrls: ['./list-cash-boxes.component.css']
})

export class ListCashBoxesComponent implements OnInit {

  private cashBoxes: CashBox[] = new Array();
  private areCashBoxesEmpty: boolean = true;
  private alertMessage: any;
  private userType: string;
  private orderTerm: string[] = ['code'];
  private propertyTerm: string;
  private areFiltersVisible: boolean = false;

  constructor(
    private _cashBoxService: CashBoxService,
    private _router: Router,
    private _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCashBoxes();
  }

  private getBadge(term: string): boolean {

    return true;
  }

  private getCashBoxes(): void {  

    this._cashBoxService.getCashBoxes().subscribe(
        result => {
					if(!result.cashBoxes) {
						this.alertMessage = result.message;
					  this.cashBoxes = null;
            this.areCashBoxesEmpty = true;
					} else {
            this.alertMessage = null;
					  this.cashBoxes = result.cashBoxes;
            this.areCashBoxesEmpty = false;
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
  
  private openModal(op: string, cashBox:CashBox): void {

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