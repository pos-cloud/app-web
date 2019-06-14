import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { UnitOfMeasurement } from './../../models/unit-of-measurement';
import { UnitOfMeasurementService } from './../../services/unit-of-measurement.service';

import { AddUnitOfMeasurementComponent } from './../../components/add-unit-of-measurement/add-unit-of-measurement.component';
import { DeleteUnitOfMeasurementComponent } from './../../components/delete-unit-of-measurement/delete-unit-of-measurement.component';
import { ImportComponent } from './../../components/import/import.component';

@Component({
  selector: 'app-list-units-of-measurement',
  templateUrl: './list-units-of-measurement.component.html',
  styleUrls: ['./list-units-of-measurement.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListUnitsOfMeasurementComponent implements OnInit {

  public unitsOfMeasurement: UnitOfMeasurement[] = new Array();
  public areUnitsOfMeasurementEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<UnitOfMeasurement> = new EventEmitter<UnitOfMeasurement>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _unitOfMeasurementService: UnitOfMeasurementService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getUnitsOfMeasurement();
  }

  public getUnitsOfMeasurement(): void {

    this.loading = true;

    this._unitOfMeasurementService.getUnitsOfMeasurement().subscribe(
        result => {
          if (!result.unitsOfMeasurement) {
            this.loading = false;
            this.unitsOfMeasurement = new Array();
            this.areUnitsOfMeasurementEmpty = true;
          } else {
            this.hideMessage();
            this.loading = false;
            this.unitsOfMeasurement = result.unitsOfMeasurement;
            this.totalItems = this.unitsOfMeasurement.length;
            this.areUnitsOfMeasurementEmpty = false;
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
    this.getUnitsOfMeasurement();
  }

  public openModal(op: string, unitOfMeasurement:UnitOfMeasurement): void {

    let modalRef;
    switch(op) {
      case 'view':
        modalRef = this._modalService.open(AddUnitOfMeasurementComponent, { size: 'lg' });
        modalRef.componentInstance.unitOfMeasurementId = unitOfMeasurement._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = 'view';
        break;
      case 'add' :
        modalRef = this._modalService.open(AddUnitOfMeasurementComponent, { size: 'lg' });
        modalRef.componentInstance.operation = 'add';
        modalRef.result.then((result) => {
          this.getUnitsOfMeasurement();
        }, (reason) => {
          this.getUnitsOfMeasurement();
        });
        break;
      case 'update' :
        modalRef = this._modalService.open(AddUnitOfMeasurementComponent, { size: 'lg' });
        modalRef.componentInstance.unitOfMeasurementId = unitOfMeasurement._id;
        modalRef.componentInstance.readonly = false;
        modalRef.componentInstance.operation = 'update';
        modalRef.result.then((result) => {
          this.getUnitsOfMeasurement();
        }, (reason) => {
          this.getUnitsOfMeasurement();
        });
      break;
      case 'delete' :
          modalRef = this._modalService.open(DeleteUnitOfMeasurementComponent, { size: 'lg' })
          modalRef.componentInstance.unitOfMeasurement = unitOfMeasurement;
          modalRef.result.then((result) => {
            if (result === 'delete_close') {
              this.getUnitsOfMeasurement();
            }
          }, (reason) => {

          });
          break;
      case 'import':
        modalRef = this._modalService.open(ImportComponent, { size: 'lg' });
        let model: any = new UnitOfMeasurement();
        model.model = "unitOfMeasurement";
        model.primaryKey = "name";
        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          if (result === 'import_close') {
            this.getUnitsOfMeasurement();
          }
        }, (reason) => {

        });
        break;
      default : ;
    }
  };

  public addItem(unitOfMeasurementSelected) {
    this.eventAddItem.emit(unitOfMeasurementSelected);
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
