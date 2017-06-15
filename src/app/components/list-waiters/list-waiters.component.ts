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

  public waiters: Waiter[] = new Array();
  public areWaitersEmpty: boolean = true;
  public alertMessage: any;
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;

  constructor(
    public _waiterService: WaiterService,
    public _router: Router,
    public _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getWaiters();
  }

  public getBadge(term: string): boolean {

    return true;
  }

  public getWaiters(): void {  

    this._waiterService.getWaiters().subscribe(
        result => {
					if(!result.waiters) {
						this.alertMessage = result.message;
					  this.waiters = null;
            this.areWaitersEmpty = true;
					} else {
            this.alertMessage = null;
					  this.waiters = result.waiters;
            this.areWaitersEmpty = false;
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

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
    this.propertyTerm = property;
  }
  
  public openModal(op: string, waiter:Waiter): void {

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