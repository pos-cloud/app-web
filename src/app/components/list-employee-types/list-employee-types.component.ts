import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./list-employee-types.component.css'],
  providers: [NgbAlertConfig]
})

export class ListEmployeeTypesComponent implements OnInit {

  public employeeTypes: EmployeeType[] = new Array();
  public areEmployeeTypesEmpty: boolean = true;
  public alertMessage: any;
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;

  constructor(
    public _employeeTypeService: EmployeeTypeService,
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
    this.getEmployeeTypes();
  }

  public getBadge(term: string): boolean {

    return true;
  }

  public getEmployeeTypes(): void {  

    this._employeeTypeService.getEmployeeTypes().subscribe(
      result => {
        if(!result.employeeTypes) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
          this.employeeTypes = null;
          this.areEmployeeTypesEmpty = true;
        } else {
          this.alertMessage = null;
          this.employeeTypes = result.employeeTypes;
          this.areEmployeeTypesEmpty = false;
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
            if(result === 'save_close') {
              this.getEmployeeTypes();
            }
          }, (reason) => {
            
          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(DeleteEmployeeTypeComponent, { size: 'lg' })
          modalRef.componentInstance.employeeType = employeeType;
          modalRef.result.then((result) => {
            if(result === 'delete_close') {
              this.getEmployeeTypes();
            }
          }, (reason) => {
            
          });
        break;
      default : ;
    }
  };
}