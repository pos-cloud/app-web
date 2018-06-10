import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { Employee } from './../../models/employee';
import { User } from '../../models/user';
import { Table } from './../../models/table';
import { Turn, TurnState } from './../../models/turn';
import { Transaction, TransactionState } from './../../models/transaction';

import { EmployeeService } from './../../services/employee.service';
import { EmployeeTypeService } from './../../services/employee-type.service';
import { TableService } from './../../services/table.service';
import { TurnService } from './../../services/turn.service';
import { UserService } from './../../services/user.service';
import { TransactionService } from './../../services/transaction.service';

import { LoginComponent } from './../../components/login/login.component';
import { PrintComponent } from './../../components/print/print.component';
import { TransferState } from '@angular/platform-browser';

@Component({
  selector: 'app-select-employee',
  templateUrl: './select-employee.component.html',
  styleUrls: ['./select-employee.component.css']
})
export class SelectEmployeeComponent implements OnInit {

  public selectEmployeeForm: FormGroup;
  public employeeSelected: Employee;
  public turn: Turn;
  public employees: Employee[] = new Array();
  public alertMessage: string = "";
  public loading: boolean = false;
  @Input() requireLogin: boolean;
  @Input() op: string;
  @Input() typeEmployee: string;
  @Input() table: Table;

  public formErrors = {
    'employee': '',
    'chair': ''
  };

  public validationMessages = {
    'employee': {
      'required': 'Este campo es requerido.'
    },
    'chair': {
    }
  };

  constructor(
    public _fb: FormBuilder,
    public _employeeService: EmployeeService,
    public _employeeTypeService: EmployeeTypeService,
    public _tableService: TableService,
    public _turnService: TurnService,
    public _userService: UserService,
    public _transactionService: TransactionService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) { }

  ngOnInit() {

    this.employeeSelected = new Employee();

    this.getEmployeeTypes('where="description":"' + this.typeEmployee + '"');
    
    this.buildForm();
    this.setValuesForm();
  }

  public buildForm(): void {

    this.selectEmployeeForm = this._fb.group({
      'employee': [this.employeeSelected.name, [
          Validators.required
        ]
      ],
      'chair': [0, [
        ]
      ],
      'password': ['', [
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

  public getEmployeeTypes(query: string): void {

    this.employees = new Array();
    this.loading = true;

    this._employeeTypeService.getEmployeeTypes(query).subscribe(
      result => {
        if (!result.employeeTypes) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.loading = false;
          this.getEmployees('where="type":"' + result.employeeTypes[0]._id + '"');
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getEmployees(query: string): void {

    this.employees = new Array();
    this.loading = true;

    this._employeeService.getEmployees(query).subscribe(
      result => {
        if (!result.employees) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.loading = false;
          this.employees = result.employees;
          this.employeeSelected = this.employees[0];
          this.setValuesForm();
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public setValuesForm(): void {

    var chair = 0;
    var password = '';

    if (!this.employeeSelected && this.employees.length > 0) this.employeeSelected = this.employees[0];
    if (!this.employeeSelected && this.employees.length === 0) this.employeeSelected = null;
    if (this.table && this.table.chair) chair = this.table.chair;

    this.selectEmployeeForm.setValue({
      'employee': this.employeeSelected,
      'chair': chair,
      'password': this.selectEmployeeForm.value.password
    });
  }
  
  public getTransactions(query: string, turn?: Turn): void {
    
    this.loading = true;

    this._transactionService.getTransactions(query).subscribe(
      result => {
        if (!result.transactions) {
          this.closeTurn(turn);
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

    this._turnService.getOpenTurn(this.employeeSelected._id).subscribe(
      result => {
        if (!result.turns) {
          if (this.op === "close-turn") {
            this.showMessage("El empleado no tiene turnos abiertos", "info", true);
          } else {
            this.openTurn();
          }
        } else {
          switch(this.op) {
            case "open-turn":
              this.showMessage("El empleado seleccionado ya tiene el turno abierto", "info", true);
              break;
            case "close-turn":
              let turn = result.turns[0];
              this.getTransactions('where="turnOpening":"' + turn._id + '"},{"$or":[{"state":"' + TransactionState.Pending + '"},{"state": "' + TransactionState.Open + '"}]', turn);
              break;
            case "change-employee":
              this.activeModal.close({ employee: this.employeeSelected, turn: turn });
              break;
            case "charge":
              this.activeModal.close({ employee: this.employeeSelected });
              break;
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

  public closeTurn(turn: Turn): void {

    turn.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    turn.state = TurnState.Closed;

    this._turnService.updateTurn(turn).subscribe(
      result => {
        if (!result.turn) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          let modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.turn = result.turn;
          modalRef.componentInstance.typePrint = 'turn';
          modalRef.result.then((result) => {
            this.activeModal.close({ turn: result.turn });
          }, (reason) => {
            this.activeModal.close({ turn: result.turn });
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

    this._userService.getUserOfEmployee(this.employeeSelected._id).subscribe(
      result => {
        if (!result.users) {
          this.showMessage("Tienes configurado para que pida autorización, pero no tiene creado un usuario el empleado.", "info", true);
        } else {
          this.login(result.users[0]);
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

    let turn = new Turn();
    turn.employee = this.employeeSelected;
    this.loading = true;

    this._turnService.saveTurn(turn).subscribe(
      result => {
        if (!result.turn) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          turn = result.turn;
          switch(this.op) {
            case "change-employee":
              this.activeModal.close({ employee: this.employeeSelected, turn: turn });
              break;
            case "open-turn":
              this.activeModal.close({ turn: turn });
              break;
            case "charge":
              this.activeModal.close({ employee: this.employeeSelected });
              break;
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

    this.employeeSelected = this.selectEmployeeForm.value.employee;

    if (this.requireLogin) {
      this.getUserOfEmployee();
    } else {
      switch (this.op) {
        case "open-turn":
          this.getOpenTurn();
          break;
        case "close-turn":
          this.getOpenTurn();
          break;
        case "select-employee":
          if (this.table) {
            this.table.chair = this.selectEmployeeForm.value.chair;
            this.activeModal.close({ employee: this.employeeSelected, table: this.table });
          } else {
            this.activeModal.close({ employee: this.employeeSelected });
          }
          break;
        case "charge":
          this.getOpenTurn();
          break;
        case "change-employee":
          this.getOpenTurn();
          break;
          default:
            break;
      }
    }
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

  public login(user: User): void {
    
    this.loading = true;
    
    user.password = this.selectEmployeeForm.value.password;

    //Obtener el token del usuario
    this._userService.login(user).subscribe(
      result => {
        if (!result.user) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          user = result.user;
          this.loading = false;
          switch(this.op) {
            case "open-turn":
              this.getOpenTurn();
              break;
            case "close-turn":
              this.getOpenTurn();
              break;
            case "select-employee":
              if (this.table) {
                this.table.chair = this.selectEmployeeForm.value.chair;
                this.activeModal.close({ employee: this.employeeSelected, table: this.table });
              } else {
                this.activeModal.close({ employee: this.employeeSelected });
              }
              break;
            case "charge":
              this.getOpenTurn();
              break;
            case "change-employee":
              this.getOpenTurn();
              break;
            default:
              break;
          }
        }
      },
      error => {
        if (error.status === 0) {
          this.showMessage("Error de conexión con el servidor. Comunicarse con Soporte.", "danger", false);
        } else {
          this.showMessage(error._body, "danger", false);
        }
        this.loading = false;
      }
    )
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