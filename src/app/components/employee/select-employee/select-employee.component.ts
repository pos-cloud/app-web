import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Employee } from '../employee';
import { Table } from 'app/components/table/table';
import { EmployeeService } from '../employee.service';
import { EmployeeTypeService } from 'app/components/employee-type/employee-type.service';
import { TableService } from 'app/components/table/table.service';
import { AuthService } from 'app/components/login/auth.service';
import { TransactionService } from 'app/components/transaction/transaction.service';
import { UserService } from 'app/components/user/user.service';
import { EmployeeType } from 'app/components/employee-type/employee-type.model';

@Component({
    selector: 'app-select-employee',
    templateUrl: './select-employee.component.html',
    styleUrls: ['./select-employee.component.css']
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
        public _fb: FormBuilder,
        public _employeeService: EmployeeService,
        public _employeeTypeService: EmployeeTypeService,
        public _tableService: TableService,
        public _authService: AuthService,
        public _transactionService: TransactionService,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _modalService: NgbModal,
        public _userService: UserService
    ) { }

    ngOnInit() {

        this.employeeSelected = new Employee();

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
            result => {
                if (!result.employees) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.hideMessage();
                    this.loading = false;
                    this.employees = result.employees;
                    if (this.employees && this.employees.length > 0) {
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

    public selectEmployee(): void {

        if (this.isValidForm()) {
            switch (this.op) {
                case "select-employee":
                    if (this.table) {
                        this.table.chair = this.chair;
                        this.activeModal.close({ employee: this.employeeSelected, table: this.table });
                    } else {
                        this.activeModal.close({ employee: this.employeeSelected });
                    }
                    break;
                case "open-table":
                    this.activeModal.close({ employee: this.employeeSelected, diners: this.chair });
                    break;
                case "change-employee":
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

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
        this.alertConfig.type = type;
        this.alertConfig.dismissible = dismissible;
    }

    public hideMessage(): void {
        this.alertMessage = '';
    }
}
