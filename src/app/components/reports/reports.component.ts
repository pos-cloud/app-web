import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Employee } from './../../models/employee';
import { Transaction } from './../../models/transaction';

import { TransactionService } from './../../services/transaction.service';
import { EmployeeService } from './../../services/employee.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  providers: [NgbAlertConfig]
})
export class ReportsComponent implements OnInit {

  public date: Date;
  public employee: Employee;
  public transactionForm : FormGroup;
  public transactions: Transaction[] = new Array();
  public alertMessage: string = "";
  public employees: Employee[] = new Array();
  public areTransactionsEmpty: boolean = true;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;

  public formErrors = {
    'employee': '',
    'date': ''
  };

  public validationMessages = {
    'employee': {
      'required':       'Este campo es requerido.'
    },
    'date' : {
      'required':       'Este campo es requerido'
    }
  };

  constructor(
    public _transactionService: TransactionService,
    public _employeeService: EmployeeService,
    public _router: Router,
    public _fb: FormBuilder,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit() {
    this.employee = new Employee();
    this.date = new Date();
    this.getEmployees();
    this.buildForm();
  }

  public getEmployees(): void {  

    this._employeeService.getEmployees().subscribe(
        result => {
					if(!result.employees) {
            this.showMessage(result.message, "info", true); 
            this.loading = false;
					  this.employees = null;
					} else {
            this.hideMessage();
            this.loading = false;
					  this.employees = result.employees;
          }
				},
				error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
				}
      );
   }

  public buildForm(): void {

    this.transactionForm = this._fb.group({
      'employee': [this.employee, [
          Validators.required
        ]
      ],
      'date' : [this.date, [
          Validators.required
        ]
      ]
    });

    this.transactionForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.transactionForm) { return; }
    const form = this.transactionForm;

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

  public reportByEmployeeByDay(): void {

    this.loading = true;
    this.employee = this.transactionForm.value.employee;

    this._transactionService.getTransactionsByEmployee(this.employee._id,"2017-06-02").subscribe(
      result => {
        if(!result.transactions) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
          this.transactions = null;
          this.areTransactionsEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.transactions = result.transactions;
          this.areTransactionsEmpty = false;
        }
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

  public hideMessage():void {
    this.alertMessage = "";
  }
}