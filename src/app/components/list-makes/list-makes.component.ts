import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Make } from './../../models/make';
import { MakeService } from './../../services/make.service';

import { AddMakeComponent } from './../../components/add-make/add-make.component';
import { UpdateMakeComponent } from './../../components/update-make/update-make.component';
import { DeleteMakeComponent } from './../../components/delete-make/delete-make.component';

@Component({
  selector: 'app-list-makes',
  templateUrl: './list-makes.component.html',
  styleUrls: ['./list-makes.component.css']
})

export class ListMakesComponent implements OnInit {

  private makes: Make[];
  private areMakesEmpty: boolean = true;
  private alertMessage: any;
  private userType: string;
  private orderTerm: string[] = ['description'];
  private filters: boolean = false;
  @Output() eventAddItem: EventEmitter<Make> = new EventEmitter<Make>();

  constructor(
    private _makeService: MakeService,
    private _router: Router,
    private _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    
    this._router.events.subscribe((data:any) => { 
      let pathLocation: string;
      pathLocation = data.url.split('/');
      this.userType = pathLocation[1];
    });
    this.getMakes();
  }

  private getBadge(term: string): boolean {

    return true;
  }

  private getMakes(): void {  

    this._makeService.getMakes().subscribe(
        result => {
          this.makes = result.makes;
          if(!this.makes) {
            this.alertMessage = "Error al traer los salones. Error en el servidor.";
            this.areMakesEmpty = true;
          } else if(this.makes.length !== 0){
             this.areMakesEmpty = false;
          } else {
            this.areMakesEmpty = true;
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
  
  private openModal(op: string, make:Make): void {

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

    private addItem(makeSelected) {
      this.eventAddItem.emit(makeSelected);
    }
}
