import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Table, TableState } from './../../models/table';
import { Room } from './../../models/room';
import { Employee } from './../../models/employee';
import { Turn } from './../../models/turn';

import { EmployeeService } from './../../services/employee.service';
import { TableService } from './../../services/table.service';
import { SaleOrderService } from './../../services/sale-order.service';
import { TurnService } from './../../services/turn.service';

import { AddTableComponent } from './../../components/add-table/add-table.component';
import { UpdateTableComponent } from './../../components/update-table/update-table.component';
import { DeleteTableComponent } from './../../components/delete-table/delete-table.component';
import { LoginComponent } from './../../components/login/login.component';

@Component({
  selector: 'app-list-tables',
  templateUrl: './list-tables.component.html',
  styleUrls: ['./list-tables.component.css'],
  providers: [NgbAlertConfig]
})

export class ListTablesComponent implements OnInit {

  public tableSelected: Table;
  public tables: Table[];
  public areTablesEmpty: boolean = true;
  public alertMessage: any;
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public employee: Employee;
  public waiters: Employee[] = new Array();
  @ViewChild('content') content:ElementRef;
  public selectEmployeeForm: FormGroup;
  @Input() filterRoom: string;
  public loading: boolean = false;

  public formErrors = {
    'employee': ''
  };

  public validationMessages = {
    'employee': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _fb: FormBuilder,
    public _tableService: TableService,
    public _employeeService: EmployeeService,
    public _saleOrderService: SaleOrderService,
    public _turnService: TurnService,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
    if(this.filterRoom === undefined) {
      this.filterRoom = "";
    }
  }

  ngOnInit(): void {
    
    this.tables = null;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.employee = new Employee();
    this.getTables(); 
  }

  public buildForm(): void {

    this.selectEmployeeForm = this._fb.group({
      'employee': [this.employee.name, [
        ]
      ]
    });

    this.selectEmployeeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.selectEmployeeForm) { return; }
    const form = this.selectEmployeeForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public getTables(): void {  
    
    this._tableService.getTables().subscribe(
      result => {
        if(!result.tables) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
          this.tables = null;
          this.areTablesEmpty = true;
        } else {
          this.alertMessage = null;
          this.tables = result.tables;
          this.areTablesEmpty = false;
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

  public refresh(): void {
    this.getTables();
  }
  
  public openModal(op: string, table: Table, employee?: Employee): void {

    this.tableSelected = table;
    if(employee !== undefined) this.tableSelected.employee = employee;
    let modalRef;
    
    switch(op) {
      case 'add' :

        modalRef = this._modalService.open(AddTableComponent, { size: 'lg' }).result.then((result) => {
          this.getTables();
        }, (reason) => {
          this.getTables();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(UpdateTableComponent, { size: 'lg' })
          modalRef.componentInstance.table = this.tableSelected;
          modalRef.result.then((result) => {
            if(result === 'save_close') {
              this.getTables();
            }
          }, (reason) => {
            
          });
        break;
      case 'delete' :

          modalRef = this._modalService.open(DeleteTableComponent, { size: 'lg' });
          modalRef.componentInstance.table = this.tableSelected;
          modalRef.result.then((result) => {
            if(result === 'delete_close') {
              this.getTables();
            }
          }, (reason) => {
            
          });
        break;
      case 'select_employee' :

          if(this.tableSelected.employee !== undefined &&
            this.tableSelected.employee !== null) {

            this.addSaleOrder();
          } else {
            
            this.tableSelected.employee = new Employee();
            this.buildForm();
            this.getWaiters();

            modalRef = this._modalService.open(this.content).result.then((result) => {
              if(result  === "select_employee") {
                this.loading = true;
                this.selectEmployee();
              } else {
                this.tableSelected.employee = null;
                this.loading = false;
              }
            }, (reason) => {
              this.tableSelected.employee = null;
                this.loading = false;
            });
          }
        break;
        case 'login' :
          modalRef = this._modalService.open(LoginComponent, { size: 'lg' });
          modalRef.componentInstance.employeeSelected = this.tableSelected.employee;
          modalRef.result.then((result) => {
            if(result._id) {
              this.openTurn(result);
            } else {
              this.tableSelected.employee = null;
            }
          }, (reason) => {
            this.tableSelected.employee = null;
          });
        break;
      default : ;
    }
  };

  public getOpenTurn(employee: Employee): void {

    this._turnService.getOpenTurn(employee._id).subscribe(
      result => {
        if (!result.turns) {
          this.loading = false;
          this.openModal('login', this.tableSelected);
        } else {
          this.loading = false;
          this.assignEmployee();
        }
      },
      error => {
        this.alertMessage = error._body;
        if (!this.alertMessage) {
          this.alertMessage = "Ha ocurrido un error en el servidor";
        }
      }
    );
  }

  public openTurn(employee: Employee): void {

    let turn: Turn = new Turn();
    turn.employee = employee;

    this._turnService.saveTurn(turn).subscribe(
      result => {
        if (!result.turn) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.assignEmployee();
        }
      },
      error => {
        this.alertMessage = error._body;
        if (!this.alertMessage) {
          this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    )
  }

  public selectEmployee(): void {
    this.employee = this.selectEmployeeForm.value.employee;
    this.tableSelected.employee = this.employee;
    this.getOpenTurn(this.employee);
  }

  public getWaiters(): void {  

    this._employeeService.getEmployees().subscribe(
      result => {
        if(!result.employees) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.alertMessage = null;
          for(let waiter of result.employees){
            if(waiter.type.description === "Mozo") {
              this.waiters.push(waiter);
            }
          }
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

  public assignEmployee(): void {
    
    this._tableService.updateTable(this.tableSelected).subscribe(
      result => {
          if(!result.table) {
            this.loading = false;
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
          } else {
            this.alertMessage = null;
            this.loading = false;
            this.addSaleOrder();
          }
        },
        error => {
          this.alertMessage = error._body;
          if(!this.alertMessage) {
            this.loading = false;
            this.alertMessage = "Ha ocurrido un error en el servidor";
          }
        }
    );
  }

  public addSaleOrder() {
    this._router.navigate(['/pos/salones/'+this.filterRoom+'/mesas/'+this.tableSelected._id+'/agregar-pedido']);
  }
}