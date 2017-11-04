import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/pt-br';

import { Employee } from './../../models/employee';
import { Table } from './../../models/table';
import { Turn, TurnState } from './../../models/turn';
import { Transaction, TransactionState } from './../../models/transaction';

import { EmployeeService } from './../../services/employee.service';
import { TableService } from './../../services/table.service';
import { TurnService } from './../../services/turn.service';
import { UserService } from './../../services/user.service';
import { TransactionService } from './../../services/transaction.service';

import { LoginComponent } from './../../components/login/login.component';
import { PrintComponent } from './../../components/print/print.component';

@Component({
  selector: 'app-select-employee',
  templateUrl: './select-employee.component.html',
  styleUrls: ['./select-employee.component.css']
})
export class SelectEmployeeComponent implements OnInit {

  public selectEmployeeForm: FormGroup;
  public employee: Employee;
  public table: Table;
  public turn: Turn;
  public waiters: Employee[] = new Array();
  public alertMessage: string = "";
  public loading: boolean = false;
  @Input() requireLogin: boolean;
  @Input() op: string;

  public formErrors = {
    'employee': '',
    'chair': ''
  };

  public validationMessages = {
    'employee': {
      'required': 'Este campo es requerido.'
    },
    'chair': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _fb: FormBuilder,
    public _employeeService: EmployeeService,
    public _tableService: TableService,
    public _turnService: TurnService,
    public _userService: UserService,
    public _transactionService: TransactionService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) { }

  ngOnInit() {
    this.employee = new Employee();
    if (!this.table) {
      this.table = new Table();
    }
    this.buildForm();
    this.getWaiters();
  }

  public buildForm(): void {

    this.selectEmployeeForm = this._fb.group({
      'employee': [this.employee.name, [
        Validators.required
      ]
      ],
      'chair': [this.table.chair, [
        Validators.required
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

  public getWaiters(): void {

    this.waiters = new Array();
    this.loading = true;

    this._employeeService.getEmployees().subscribe(
      result => {
        if (!result.employees) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.loading = false;
          for (let waiter of result.employees) {
            if (waiter.type.description === "Mozo") {
              this.waiters.push(waiter);
            }
          }
          if (this.waiters.length === 0) {
            this.showMessage("No se encontraron mozos", "info", true);
            this.loading = false;
          } else {
            this.employee = this.waiters[0];
            this.selectEmployeeForm.setValue({
              'employee': this.employee,
              'chair': this.table.chair
            });
          }
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public openModal(op: string): void {

    let modalRef;

    switch (op) {
      case 'login':
        modalRef = this._modalService.open(LoginComponent);
        modalRef.componentInstance.employeeSelected = this.employee;
        modalRef.result.then((result) => {
          if (typeof result == 'object') {
            this.employee = result;
            if (this.op === 'open-turn') {
              this.openTurn();
            } else if (this.op === 'close-turn') {
              this.getTransactionsOpenByEmployee();
            } else if (this.op === 'change-employee') {
              if (this.turn) {
                this.activeModal.close(this.turn);
              } else {
                this.openTurn();
              }
            } else if (this.op === 'charge') {
              if (this.turn) {
                this.activeModal.close(this.employee);
              } else {
                this.openTurn();
              }
            }
          }
          this.loading = false;
        }, (reason) => {
          this.loading = false;
        });
        break;
      default:
        break;
    }
  }

  public getTransactionsOpenByEmployee(): void {

    this.loading = true;

    this._transactionService.getOpenSaleOrdersByEmployee(this.employee._id).subscribe(
      result => {
        if (!result.transactions) {
          this.getUserOfEmployee();
        } else {
          this.showMessage("No puede cerrar el turno del empleado si tiene pedidos pendientes", "info", true);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getOpenTurn(): void {

    this.loading = true;

    this._turnService.getOpenTurn(this.employee._id).subscribe(
      result => {
        if (!result.turns) {
          if (this.op === "close") {
            this.showMessage("El empleado no tiene turnos abiertos", "info", true);
          } else {
            this.getUserOfEmployee();
          }
        } else {
          this.turn = result.turns[0];
          if (this.op === 'open-turn') {
            this.showMessage("El empleado seleccionado ya tiene el turno abierto", "info", true);
          } else if (this.op === 'close-turn') {
            this.getTransactionsOpenByEmployee();
          } else if (this.op === 'change-employee') {
            if (this.requireLogin) {
              this.getUserOfEmployee();
            } else {
              this.activeModal.close(this.employee);
            }
          } else if (this.op === 'charge') {
            if (this.requireLogin) {
              this.openModal('login');
            } else {
              this.activeModal.close(this.employee);
            }
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public closeTurn(): void {

    this.turn.endDate = moment().locale('es').format('YYYY/MM/DD') + " " + moment().locale('es').format('LTS');
    this.turn.state = TurnState.Closed;

    this._turnService.updateTurn(this.turn).subscribe(
      result => {
        if (!result.turn) {
          this.showMessage(result.message, "info", true);
        } else {
          let modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.turn = result.turn;
          modalRef.componentInstance.typePrint = 'turn';
          modalRef.result.then((result) => {
            this.activeModal.close(result);
          }, (reason) => {
            this.activeModal.close(result);
          });
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getUserOfEmployee(): void {

    this.loading = true;

    this._userService.getUserOfEmployee(this.employee._id).subscribe(
      result => {
        if (!result.users) {
          if (this.op === 'close-turn') {
            this.closeTurn();
          } else if (this.op === 'change-employee') {
            if (this.turn) {
              this.activeModal.close(this.turn);
            } else {
              this.openTurn();
            }
          } else if (this.op === 'open-turn') {
            this.openTurn();
          } else if (this.op === 'charge') {
            this.openTurn();
          }
        } else {
          this.openModal('login');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public openTurn(): void {

    this.turn = new Turn();
    this.turn.employee = this.employee;
    this.loading = true;

    this._turnService.saveTurn(this.turn).subscribe(
      result => {
        if (!result.turn) {
          this.showMessage(result.message, "info", true);
        } else {
          this.turn = result.turn;
          if (this.op === "change-employee") {
            this.activeModal.close(this.turn);
          } else {
            this.activeModal.close(this.employee);
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    )
  }

  public selectEmployee(): void {
    this.employee = this.selectEmployeeForm.value.employee;
    this.table.chair = this.selectEmployeeForm.value.chair;
    if (this.op !== 'turn' && this.op !== 'close-turn') {
      this.updateTable();
    }
    this.getOpenTurn();
  }

  public addChair(): void {
    this.selectEmployeeForm.setValue({
      'employee': this.selectEmployeeForm.value.employee,
      'chair': this.selectEmployeeForm.value.chair + 1
    });
  }

  public subtractChair(): void {
    if (this.selectEmployeeForm.value.chair > 1) {
      this.selectEmployeeForm.setValue({
        'employee': this.selectEmployeeForm.value.employee,
        'chair': this.selectEmployeeForm.value.chair - 1
      });
    } else {
      this.selectEmployeeForm.setValue({
        'employee': this.selectEmployeeForm.value.employee,
        'chair': 1
      });
    }
  }

  public updateTable(): void {

    this.loading = true;

    this._tableService.updateTable(this.table).subscribe(
      result => {
        if (!result.table) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.table = result.table;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}