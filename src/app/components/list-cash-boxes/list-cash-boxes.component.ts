import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CashBox } from './../../models/cash-box';
import { CashBoxService } from './../../services/cash-box.service';

import { AddCashBoxComponent } from './../../components/add-cash-box/add-cash-box.component';
import { UpdateCashBoxComponent } from './../../components/update-cash-box/update-cash-box.component';
import { DeleteCashBoxComponent } from './../../components/delete-cash-box/delete-cash-box.component';

@Component({
  selector: 'app-list-cash-boxes',
  templateUrl: './list-cash-boxes.component.html',
  styleUrls: ['./list-cash-boxes.component.css']
})

export class ListCashBoxesComponent implements OnInit {

  private cashBoxes: CashBox[];
  private alertMessage: any;
  private userType: string;
  private orderTerm: string[] = ['code'];
  private filters: boolean = false;

  constructor(
    private _cashBoxService: CashBoxService,
    private _router: Router,
    private _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    
    this._router.events.subscribe((data:any) => { 
      let pathLocation: string;
      pathLocation = data.url.split('/');
      this.userType = pathLocation[1];
    });
    this.getCashBoxes();
  }

  private getBadge(term: string): boolean {

    return true;
  }

  private getCashBoxes(): void {  

    this._cashBoxService.getCashBoxes().subscribe(
        result => {
					this.cashBoxes = result.cashBoxes;
					if(!this.cashBoxes) {
						this.alertMessage = "Error al traer cajas. Error en el servidor.";
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

  private orderBy (term: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
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
        case 'update' :
            modalRef = this._modalService.open(UpdateCashBoxComponent, { size: 'lg' })
            modalRef.componentInstance.cashBox = cashBox;
            modalRef.result.then((result) => {
              if(result === 'save_close') {
                this.getCashBoxes();
              }
            }, (reason) => {
              
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