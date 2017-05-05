import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Waiter } from './../../models/waiter';
import { WaiterService } from './../../services/waiter.service';

import { AddWaiterComponent } from './../../components/add-waiter/add-waiter.component';
import { UpdateWaiterComponent } from './../../components/update-waiter/update-waiter.component';
import { DeleteWaiterComponent } from './../../components/delete-waiter/delete-waiter.component';

@Component({
  selector: 'app-list-waiters',
  templateUrl: './list-waiters.component.html',
  styleUrls: ['./list-waiters.component.css']
})

export class ListWaitersComponent implements OnInit {

  private waiters: Waiter[];
  private alertMessage: any;
  private userType: string;
  private orderTerm: string[] = ['code'];
  private filters: boolean = false;

  constructor(
    private _waiterService: WaiterService,
    private _router: Router,
    private _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    
    this._router.events.subscribe((data:any) => { 
      let pathLocation: string;
      pathLocation = data.url.split('/');
      this.userType = pathLocation[1];
    });
    this.getWaiters();
  }

  private getBadge(term: string): boolean {

    return true;
  }

  private getWaiters(): void {  

    this._waiterService.getWaiters().subscribe(
        result => {
					this.waiters = result.waiters;
					if(!this.waiters) {
						this.alertMessage = "Error al traer artículos. Error en el servidor.";
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
  
  private openModal(op: string, waiter:Waiter): void {

    let modalRef;
    switch(op) {
      case 'add' :
        modalRef = this._modalService.open(AddWaiterComponent, { size: 'lg' }).result.then((result) => {
          this.getWaiters();
        }, (reason) => {
          this.getWaiters();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(UpdateWaiterComponent, { size: 'lg' })
          modalRef.componentInstance.waiter = waiter;
          modalRef.result.then((result) => {
            if(result === 'save_close') {
              this.getWaiters();
            }
          }, (reason) => {
            
          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(DeleteWaiterComponent, { size: 'lg' })
          modalRef.componentInstance.waiter = waiter;
          modalRef.result.then((result) => {
            if(result === 'delete_close') {
              this.getWaiters();
            }
          }, (reason) => {
            
          });
        break;
      default : ;
    }
  };
}