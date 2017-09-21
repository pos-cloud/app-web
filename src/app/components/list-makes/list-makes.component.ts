import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Make } from './../../models/make';
import { MakeService } from './../../services/make.service';

import { AddMakeComponent } from './../../components/add-make/add-make.component';
import { UpdateMakeComponent } from './../../components/update-make/update-make.component';
import { DeleteMakeComponent } from './../../components/delete-make/delete-make.component';
import { ImportComponent } from './../../components/import/import.component';

@Component({
  selector: 'app-list-makes',
  templateUrl: './list-makes.component.html',
  styleUrls: ['./list-makes.component.css'],
  providers: [NgbAlertConfig]
})

export class ListMakesComponent implements OnInit {

  public makes: Make[] = new Array();
  public areMakesEmpty: boolean = true;
  public alertMessage: string = "";
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<Make> = new EventEmitter<Make>();
  public itemsPerPage = 10;

  constructor(
    public _makeService: MakeService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getMakes();
  }

  public getMakes(): void {  

    this.loading = true;
    
    this._makeService.getMakes().subscribe(
        result => {
          if(!result.makes) {
            this.showMessage(result.message, "info", true); 
            this.loading = false;
            this.makes = null;
            this.areMakesEmpty = true;
          } else {
            this.hideMessage();
            this.loading = false;
            this.makes = result.makes;
            this.areMakesEmpty = false;
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
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
    this.getMakes();
  }
  
  public openModal(op: string, make:Make): void {

    let modalRef;
    switch(op) {
      case 'view':
        modalRef = this._modalService.open(UpdateMakeComponent, { size: 'lg' });
        modalRef.componentInstance.make = make;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add' :
        modalRef = this._modalService.open(AddMakeComponent, { size: 'lg' }).result.then((result) => {
          this.getMakes();
        }, (reason) => {
          this.getMakes();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(UpdateMakeComponent, { size: 'lg' });
          modalRef.componentInstance.make = make;
          modalRef.componentInstance.readonly = false;
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
      case 'import':
        modalRef = this._modalService.open(ImportComponent, { size: 'lg' });
        let model: any = new Make();
        model.model = "make";
        model.primaryKey = "description";
        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          if (result === 'import_close') {
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
    
  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = "";
  }
}
