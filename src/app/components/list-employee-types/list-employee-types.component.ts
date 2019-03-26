import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { EmployeeType } from './../../models/employee-type';
import { EmployeeTypeService } from './../../services/employee-type.service';

import { AddEmployeeTypeComponent } from './../../components/add-employee-type/add-employee-type.component';
import { UpdateEmployeeTypeComponent } from './../../components/update-employee-type/update-employee-type.component';
import { DeleteEmployeeTypeComponent } from './../../components/delete-employee-type/delete-employee-type.component';

@Component({
  selector: 'app-list-employee-types',
  templateUrl: './list-employee-types.component.html',
  styleUrls: ['./list-employee-types.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListEmployeeTypesComponent implements OnInit {

  public employeeTypes: EmployeeType[] = new Array();
  public areEmployeeTypesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _employeeTypeService: EmployeeTypeService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getEmployeeTypes();
  }

  public getEmployeeTypes(): void {

    this.loading = true;

    this._employeeTypeService.getEmployeeTypes().subscribe(
      result => {
        if (!result.employeeTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.employeeTypes = null;
          this.areEmployeeTypesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.employeeTypes = result.employeeTypes;
          this.totalItems = this.employeeTypes.length;
          this.areEmployeeTypesEmpty = false;
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
    this.getEmployeeTypes();
  }

  public openModal(op: string, employeeType:EmployeeType): void {

    let modalRef;
    switch(op) {
      case 'add' :
        modalRef = this._modalService.open(AddEmployeeTypeComponent, { size: 'lg' }).result.then((result) => {
          this.getEmployeeTypes();
        }, (reason) => {
          this.getEmployeeTypes();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(UpdateEmployeeTypeComponent, { size: 'lg' })
          modalRef.componentInstance.employeeType = employeeType;
          modalRef.result.then((result) => {
            if (result === 'save_close') {
              this.getEmployeeTypes();
            }
          }, (reason) => {

          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(DeleteEmployeeTypeComponent, { size: 'lg' })
          modalRef.componentInstance.employeeType = employeeType;
          modalRef.result.then((result) => {
            if (result === 'delete_close') {
              this.getEmployeeTypes();
            }
          }, (reason) => {

          });
        break;
      default : ;
    }
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
