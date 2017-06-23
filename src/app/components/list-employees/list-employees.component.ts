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
  public alertMessage: any;
  public userType: string;
  public orderTerm: string[] = ['code'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;

  constructor(
    public _employeeService: EmployeeService,
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
    this.getEmployees();
  }

  public getBadge(term: string): boolean {

    return true;
  }

  public getEmployees(): void {  

    this._employeeService.getEmployees().subscribe(
        result => {
					if(!result.employees) {
						this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
					  this.employees = null;
            this.areEmployeesEmpty = true;
					} else {
            this.alertMessage = null;
					  this.employees = result.employees;
            this.areEmployeesEmpty = false;
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
  
  public openModal(op: string, employee:Employee): void {

    let modalRef;
    switch(op) {
      case 'add' :
        modalRef = this._modalService.open(AddEmployeeComponent, { size: 'lg' }).result.then((result) => {
          this.getEmployees();
        }, (reason) => {
          this.getEmployees();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(UpdateEmployeeComponent, { size: 'lg' })
          modalRef.componentInstance.employee = employee;
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
  };
}