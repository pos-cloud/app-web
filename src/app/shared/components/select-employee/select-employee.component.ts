import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormsModule, UntypedFormBuilder } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Employee, EmployeeType, Table } from '@types';
import { AuthService } from 'app/core/services/auth.service';
import { EmployeeTypeService } from 'app/core/services/employee-type.service';
import { TableService } from 'app/core/services/table.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { UserService } from 'app/core/services/user.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-select-employee',
  templateUrl: './select-employee.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, PipesModule, TranslateModule],
})
export class SelectEmployeeComponent implements OnInit {
  public employees: Employee[] = new Array();
  public employeeSelected: Employee;
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
    public _fb: UntypedFormBuilder,
    public _employeeService: EmployeeService,
    public _employeeTypeService: EmployeeTypeService,
    public _tableService: TableService,
    public _authService: AuthService,
    public _transactionService: TransactionService,
    public activeModal: NgbActiveModal,
    public _modalService: NgbModal,
    public _toast: ToastService,
    public _userService: UserService
  ) {}

  ngOnInit() {
    if (this.typeEmployee) {
      this.getEmployees('where="type":"' + this.typeEmployee._id + '"');
    }

    if (this.table) {
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
      (result) => {
        if (!result.employees) {
          if (result.message && result.message !== '')
            this._toast.showToast(result.message, 'info');
          this.loading = false;
        } else {
          this.loading = false;
          this.employees = result.employees;
          if (this.employees && this.employees.length > 0) {
            this.employeeSelected = this.employees[0];
          }
        }
      },
      (error) => {
        this._toast.showToast(error._body);
        this.loading = false;
      }
    );
  }

  public selectEmployee(): void {
    if (this.isValidForm()) {
      switch (this.op) {
        case 'select-employee':
          if (this.table) {
            this.table.chair = this.chair;
            this.activeModal.close({
              employee: this.employeeSelected,
              table: this.table,
            });
          } else {
            this.activeModal.close({ employee: this.employeeSelected });
          }
          break;
        case 'open-table':
          this.activeModal.close({
            employee: this.employeeSelected,
            diners: this.chair,
          });
          break;
        case 'change-employee':
          this.activeModal.close({ employee: this.employeeSelected });
          break;
        default:
          break;
      }
    }
  }

  public isValidForm(): boolean {
    let isValid: boolean = true;

    if (this.table && this.chair <= 0) {
      isValid = false;
      this._toast.showToast({
        message: 'La cantidad de comensables debe ser superior a 0',
      });
    }

    if (this.requireLogin && (!this.password || this.password === '')) {
      isValid = false;
      this._toast.showToast({
        message:
          'Debe completar la contraseña del ' + this.typeEmployee.description,
      });
    }

    if (!this.employeeSelected || !this.employeeSelected._id) {
      isValid = false;
      this._toast.showToast({
        message: 'Debe seleccionar un ' + this.typeEmployee.description,
      });
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
}
