import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Location } from './../../models/location';
import { LocationService } from './../../services/location.service';

import { LocationComponent } from '../location/location.component';

@Component({
  selector: 'app-list-locations',
  templateUrl: './list-locations.component.html',
  styleUrls: ['./list-locations.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
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
  public relationOfBranchEmpty : boolean = true;
  public currentPage: number = 0;
  public displayedColumns = [
    "positionZ",
    "positionY",
    "positionX",
    "deposit.name"
  ];
  public filters: any[];
  public filterValue: string;

  constructor(
    public _locationService: LocationService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
   }

  ngOnInit() : void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getLocations();
  }

  public getLocations(): void {

    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sortAux;
    if (this.orderTerm[0].charAt(0) === '-') {
        sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
    } else {
        sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
    }
    sortAux = JSON.parse(sortAux);

    // FILTRAMOS LA CONSULTA

    let match = `{`;
    for(let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != "") {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
        match += ',';
      }
    }

    match += `"operationType": { "$ne": "D" }, "deposit.operationType": { "$ne": "D" } }`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      positionZ: { $toString: '$number' },
      positionY: 1,
      positionX: 1,
      description : 1,
      'deposit.name' : 1,
      'deposit.operationType' : 1,
      operationType: 1
    }

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        locations: { $push: "$$ROOT" }
    };

    let page = 0;
    if(this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
                0 // SKIP

    this._locationService.getLocationsV2(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        this.itemsPerPage, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if (result && result[0] && result[0].locations) {
          this.locations = result[0].locations;
          this.totalItems = result[0].count;
          this.relationOfBranchEmpty = false;
        } else {
          this.locations = new Array();
          this.totalItems = 0;
          this.relationOfBranchEmpty = true;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
   }

  public pageChange(page): void {
    this.currentPage = page;
    this.getLocations();
  }

  public orderBy(term: string): void {

      if (this.orderTerm[0] === term) {
        this.orderTerm[0] = "-" + term;
      } else {
        this.orderTerm[0] = term;
      }
      this.getLocations();
  }

  public refresh(): void {
    this.getLocations();
  }

  public openModal(op: string, location:Location): void {

    let modalRef;
    switch(op) {
      case 'view':
        modalRef = this._modalService.open(LocationComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.locationId = location._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = "view";
        break;
      case 'add' :
        modalRef = this._modalService.open(LocationComponent, { size: 'lg', backdrop: 'static' })
        modalRef.componentInstance.readonly = false;
        modalRef.componentInstance.operation = "add";
        modalRef.result.then((result) => {
          this.getLocations();
        }, (reason) => {
          this.getLocations();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(LocationComponent, { size: 'lg', backdrop: 'static' });
          modalRef.componentInstance.locationId = location._id;
          modalRef.componentInstance.readonly = false;
          modalRef.componentInstance.operation = "update";
          modalRef.result.then((result) => {
            if (result === 'save_close') {
              this.getLocations();
            }
          }, (reason) => {

          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(LocationComponent, { size: 'lg', backdrop: 'static' })
          modalRef.componentInstance.locationId = location._id;
          modalRef.componentInstance.readonly = true;
          modalRef.componentInstance.operation = "delete";
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
