import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Make } from './../../models/make';
import { MakeService } from './../../services/make.service';

import { AddMakeComponent } from './../../components/add-make/add-make.component';
import { UpdateMakeComponent } from './../../components/update-make/update-make.component';
import { DeleteMakeComponent } from './../../components/delete-make/delete-make.component';

@Component({
  selector: 'app-list-makes',
  templateUrl: './list-makes.component.html',
  styleUrls: ['./list-makes.component.css'],
  providers: [NgbAlertConfig]
})

export class ListMakesComponent implements OnInit {

  public makes: Make[] = new Array();
  public areMakesEmpty: boolean = true;
  public alertMessage: any;
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  @Output() eventAddItem: EventEmitter<Make> = new EventEmitter<Make>();

  constructor(
    public _makeService: MakeService,
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
    this.getMakes();
  }

  public getBadge(term: string): boolean {

    return true;
  }

  public getMakes(): void {  

    this._makeService.getMakes().subscribe(
        result => {
          if(!result.makes) {
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
            this.makes = null;
            this.areMakesEmpty = true;
          } else {
            this.alertMessage = null;
            this.makes = result.makes;
            this.areMakesEmpty = false;
          }
        },
        error => {
          this.alertMessage = error._body;
          if(!this.alertMessage) {
            this.alertMessage = "Ha ocurrido un error en el servidor";
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
  
  public openModal(op: string, make:Make): void {

      let modalRef;
      switch(op) {
        case 'add' :
          modalRef = this._modalService.open(AddMakeComponent, { size: 'lg' }).result.then((result) => {
            this.getMakes();
          }, (reason) => {
            this.getMakes();
          });
          break;
        case 'update' :
            modalRef = this._modalService.open(UpdateMakeComponent, { size: 'lg' })
            modalRef.componentInstance.make = make;
            modalRef.result.then((result) => {
              if(result === 'save_close') {
                this.getMakes();
              }
            }, (reason) => {
              
            });
          break;
        case 'delete' :
            modalRef = this._modalService.open(DeleteMakeComponent, { size: 'lg' })
            modalRef.componentInstance.make = make;
            modalRef.result.then((result) => {
              if(result === 'delete_close') {
                this.getMakes();
              }
            }, (reason) => {
              
            });
          break;
        default : ;
      }
    };

    public addItem(makeSelected) {
      this.eventAddItem.emit(makeSelected);
    }
}
