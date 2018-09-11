import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Location } from './../../models/location';
import { LocationService } from './../../services/location.service';

import { AddLocationComponent } from './../../components/add-location/add-location.component';
import { UpdateLocationComponent } from './../../components/update-location/update-location.component';
import { DeleteLocationComponent } from './../../components/delete-location/delete-location.component';

@Component({
  selector: 'app-list-locations',
  templateUrl: './list-locations.component.html',
  styleUrls: ['./list-locations.component.css'],
  providers: [NgbAlertConfig]
})
export class ListLocationsComponent implements OnInit {

  public locations: Location[] = new Array();
  public areLocationsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<Location> = new EventEmitter<Location>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _locationService: LocationService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit() : void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getLocations();
  }

  public getLocations(): void {  

    this.loading = true;
    
    this._locationService.getLocations().subscribe(
        result => {
          if (!result.locations) {
            this.loading = false;
            this.locations = null;
            this.areLocationsEmpty = true;
          } else {
            this.hideMessage();
            this.loading = false;
            this.locations = result.locations;
            this.totalItems = this.locations.length;
            this.areLocationsEmpty = false;
          }
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
    this.getLocations();
  }
  
  public openModal(op: string, location:Location): void {

    let modalRef;
    switch(op) {
      case 'view':
        modalRef = this._modalService.open(UpdateLocationComponent, { size: 'lg' });
        modalRef.componentInstance.location = location;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add' :
        modalRef = this._modalService.open(AddLocationComponent, { size: 'lg' }).result.then((result) => {
          this.getLocations();
        }, (reason) => {
          this.getLocations();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(UpdateLocationComponent, { size: 'lg' });
          modalRef.componentInstance.location = location;
          modalRef.componentInstance.readonly = false;
          modalRef.result.then((result) => {
            if (result === 'save_close') {
              this.getLocations();
            }
          }, (reason) => {
            
          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(DeleteLocationComponent, { size: 'lg' })
          modalRef.componentInstance.location = location;
          modalRef.result.then((result) => {
            if (result === 'delete_close') {
              this.getLocations();
            }
          }, (reason) => {
            
          });
          break;
      default : ;
    }
  };

  public addItem(locationSelected) {
    this.eventAddItem.emit(locationSelected);
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
