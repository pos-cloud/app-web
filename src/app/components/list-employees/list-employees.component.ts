import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Employee } from './../../models/employee';
import { EmployeeService } from './../../services/employee.service';

import { AddEmployeeComponent } from './../../components/add-employee/add-employee.component';
import { UpdateEmployeeComponent } from './../../components/update-employee/update-employee.component';
import { DeleteEmployeeComponent } from './../../components/delete-employee/delete-employee.component';

@Component({
  selector: 'app-list-employees',
  templateUrl: './list-employees.component.html',
  styleUrls: ['./list-employees.component.css'],
  providers: [NgbAlertConfig]
})

export class ListEmployeesComponent implements OnInit {

  public employees: Employee[] = new Array();
  public areEmployeesEmpty: boolean = true;
  public alertMessage: string = "";
  public userType: string;
  public orderTerm: string[] = ['code'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;

  constructor(
    public _employeeService: EmployeeService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getEmployees();
  }

  public getEmployees(): void {  

    this.loading = true;

    this._employeeService.getEmployees().subscribe(
        result => {
					if(!result.employees) {
            this.showMessage(result.message, "info", true); 
            this.loading = false;
					  this.employees = null;
            this.areEmployeesEmpty = true;
					} else {
            this.hideMessage();
            this.loading = false;
					  this.employees = result.employees;
            this.areEmployeesEmpty = false;
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
    this.getEmployees();
  }
  
  public openModal(op: string, employee:Employee): void {

    let modalRef;
    switch(op) {
      case 'view' :
          modalRef = this._modalService.open(UpdateEmployeeComponent, { size: 'lg' });
          modalRef.componentInstance.employee = employee;
          modalRef.componentInstance.readonly = true;
        break;
      case 'add' :
        modalRef = this._modalService.open(AddEmployeeComponent, { size: 'lg' }).result.then((result) => {
          this.getEmployees();
        }, (reason) => {
          this.getEmployees();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(UpdateEmployeeComponent, { size: 'lg' });
          modalRef.componentInstance.employee = employee;
          modalRef.componentInstance.readonly = false;
          modalRef.result.then((result) => {
            if(result === 'save_close') {
              this.getEmployees();
            }
          }, (reason) => {
            
          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(DeleteEmployeeComponent, { size: 'lg' })
          modalRef.componentInstance.employee = employee;
          modalRef.result.then((result) => {
            if(result === 'delete_close') {
              this.getEmployees();
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
    this.alertMessage = "";
  }
}