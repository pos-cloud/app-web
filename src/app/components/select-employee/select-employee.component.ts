import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { Employee } from './../../models/employee';
import { User } from '../../models/user';
import { Table } from './../../models/table';
import { Turn, TurnState } from './../../models/turn';
import { TransactionState } from './../../models/transaction';

import { EmployeeService } from './../../services/employee.service';
import { EmployeeTypeService } from './../../services/employee-type.service';
import { TableService } from './../../services/table.service';
import { TurnService } from './../../services/turn.service';
import { TransactionService } from './../../services/transaction.service';

import { PrintComponent } from './../../components/print/print.component';
import { EmployeeType } from 'app/models/employee-type';
import { AuthService } from 'app/services/auth.service';
import { UserService } from 'app/services/user.service';
import { Config } from 'app/app.config';

@Component({
  selector: 'app-select-employee',
  templateUrl: './select-employee.component.html',
  styleUrls: ['./select-employee.component.css']
})

export class SelectEmployeeComponent implements OnInit {

  public employees: Employee[] = new Array();
  public employeeSelected: Employee;
  public turn: Turn;
  @Input() requireLogin: boolean;
  @Input() op: string;
  @Input() typeEmployee: EmployeeType;
  @Input() table: Table;
  public chair: number = 0;
  public password: string = '';
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public _fb: FormBuilder,
    public _employeeService: EmployeeService,
    public _employeeTypeService: EmployeeTypeService,
    public _tableService: TableService,
    public _turnService: TurnService,
    public _authService: AuthService,
    public _transactionService: TransactionService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _userService: UserService
  ) { }

  ngOnInit() {

    this.employeeSelected = new Employee();
    
    if(this.typeEmployee) {
      this.getEmployees('where="type":"' + this.typeEmployee._id + '"');
    }

    if(this.table) {
      this.chair = this.table.chair;
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getEmployees(query: string): void {

    this.employees = new Array();
    this.loading = true;

    this._employeeService.getEmployees(query).subscribe(
      result => {
        if (!result.employees) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.loading = false;
          this.employees = result.employees;
          if(this.employees && this.employees.length > 0) {
            this.employeeSelected = this.employees[0];
          }
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getTransactions(query: string, turn?: Turn): void {

    this.loading = true;

    this._transactionService.getTransactions(query).subscribe(
      result => {
        if (!result.transactions) {
          this.closeTurn(turn);
        } else {
          this.showMessage("No puede cerrar el turno del empleado si tiene pedidos pendientes", 'info', true);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getOpenTurn(): void {

    this.loading = true;

    let query = 'where="employee":"' + this.employeeSelected._id + '","state":"' + TurnState.Open + '"';

    this._turnService.getTurns(query).subscribe(
      result => {
        if (!result.turns) {
          if (this.op === "close-turn") {
            this.showMessage("El empleado no tiene turnos abiertos", 'info', true);
          } else {
            this.openTurn();
          }
        } else {
          switch(this.op) {
            case "open-turn":
              this.showMessage("El empleado seleccionado ya tiene el turno abierto", 'info', true);
              break;
            case "close-turn":
              let turn = result.turns[0];
              let query = 'where="turnOpening":"' + turn._id + '"},{"$or":[{"state":"' + TransactionState.Pending + '"},{"state": "' + TransactionState.Open + '"}]';
              this.getTransactions(query, turn);
              break;
            case "change-employee":
              this.activeModal.close({ employee: this.employeeSelected, turn: turn });
              break;
            case "open-table":
              this.activeModal.close({ employee: this.employeeSelected, diners: this.chair  });
              break;
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
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
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
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
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getUserOfEmployee(): void {

    this.loading = true;

    let query = 'where="employee":"' + this.employeeSelected._id + '"&limit=1';

    this._userService.getUsers(query).subscribe(
      result => {
        if (!result.users) {
          this.showMessage("Tienes configurado para que pida autorización, pero no tiene creado un usuario el empleado.", 'info', true);
        } else {
          this.login(result.users[0]);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
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
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          turn = result.turn;
          switch(this.op) {
            case "change-employee":
              this.activeModal.close({ employee: this.employeeSelected, turn: turn });
              break;
            case "open-turn":
              this.activeModal.close({ turn: turn });
              break;
            case "open-table":
              this.activeModal.close({ employee: this.employeeSelected, diners: this.chair });
              break;
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    )
  }

  public selectEmployee(): void {

    if (this.isValidForm()) {
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
              this.table.chair = this.chair;
              this.activeModal.close({ employee: this.employeeSelected, table: this.table });
            } else {
              this.activeModal.close({ employee: this.employeeSelected });
            }
            break;
          case "open-table":
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
  }

  public isValidForm(): boolean {

    let isValid: boolean = true;

    if(this.table && this.chair <= 0) {
      isValid = false;
      this.showMessage("La cantidad de comensables debe ser superior a 0", "info", true);
    }

    if (this.requireLogin && (!this.password || this.password === '')) {
      isValid = false;
      this.showMessage("Debe completar la contraseña del " + this.typeEmployee.description, "info", true);
    }

    if (!this.employeeSelected || !this.employeeSelected._id) {
      isValid = false;
      this.showMessage("Debe seleccionar un " + this.typeEmployee.description, "info", true);
    } else {
    }

    return isValid;
  }

  public addChair(): void {

    this.chair += 1;
  }

  public subtractChair(): void {

    if (this.chair > 1) {
      this.chair -= 1;
    } else {
      this.chair = 1;
    }
  }

  public login(user: User): void {

    this.loading = true;

    user.password = this.password;

    //Obtener el token del usuario
    this._authService.login(Config.database, user.name, user.password).subscribe(
      result => {
        if (!result.user) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
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
                this.table.chair = this.chair;
                this.activeModal.close({ employee: this.employeeSelected, table: this.table });
              } else {
                this.activeModal.close({ employee: this.employeeSelected });
              }
              break;
            case "open-table":
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
          this.showMessage("Error de conexión con el servidor. Comunicarse con Soporte.", 'danger', false);
        } else {
          this.showMessage(error._body, 'danger', false);
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
    this.alertMessage = '';
  }
}
