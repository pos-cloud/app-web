import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { TransactionService } from '../../../services/transaction.service';
import { UserService } from '../../../services/user.service';
import { ConfigService } from '../../../services/config.service';
import { CompanyService } from '../../../services/company.service';


import { DateFormatPipe } from 'app/pipes/date-format.pipe';
import { RoundNumberPipe } from 'app/pipes/round-number.pipe';
import { TransactionMovement, TransactionType } from 'app/models/transaction-type';
import { Transaction, TransactionState } from 'app/models/transaction';
import { Config } from 'app/app.config';
import { Company, CompanyType } from 'app/models/company';
import { TransactionTypeService } from 'app/services/transaction-type.service';
import { Employee } from 'app/models/employee';
import { EmployeeService } from 'app/services/employee.service';
import { Branch } from 'app/models/branch';
import { BranchService } from 'app/services/branch.service';

@Component({
  selector: 'app-export-transactions',
  templateUrl: './export-transactions.component.html',
  styleUrls: ['./export-transactions.component.css']
})
export class ExportTransactionsComponent implements OnInit {

  @Input() transactionMovement : TransactionMovement;
  public exportForm: FormGroup;
  public alertMessage: string = "";
  public loading: boolean = false;
  public toggleButton: boolean;
  public VATPeriod: string;
  public compURL: string;
  public aliURL: string;
  public dateFormat = new DateFormatPipe();
  public roundNumber = new RoundNumberPipe();
  public transactions : Transaction[];
  public companies : Company[]
  public types : TransactionType[];
  public employees : Employee[];
  public branches : Branch[];
  public startDate: string;
  public endDate: string;

  public formErrors = {
    'startDate': '',
    'endDate' : '',
  };

  public validationMessages = {
    'startDate' : {
      'required':     'Este campo es requerido.'
    },
    'endDate' : {
      'required':     'Este campo es requerido.'
    }
  };

  constructor(
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public _transactionService: TransactionService,
    public _transactionTypeService : TransactionTypeService,
    public _employeeService : EmployeeService,
    public _branchesService : BranchService,
    public _configService: ConfigService,
    public _userService: UserService,
    public _companyService: CompanyService,
  ) { 
    this.roundNumber = new RoundNumberPipe();
    this.startDate = moment().format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
  }

  ngOnInit() {

    this.getCompanies();
    this.getTypes();
    this.getEmployees();
    this.getBranches();
    this.buildForm();

  }

  public buildForm(): void {
    this.exportForm = this._fb.group({
      'startDate': [, [
        Validators.required
        ]
      ],
      'endDate': [, [
        Validators.required
        ]
      ],
      'company': [,[]],
      'type': [,[]],
      'employee': [,[]],
      'branch' : [,[]]

    });
    this.exportForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.exportForm) { return; }
    const form = this.exportForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] = messages[key] + ' ';
        }
      }
    }
  }

  public getTransactions() : void {
    
    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sortAux = {};

    let timezone = "-03:00";
    if(Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

    // FILTRAMOS LA CONSULTA
    let match = `{`

    if(this.exportForm.value.company != null) {
      match += `"company._id" : { "$oid" : "${this.exportForm.value.company}"},`
    }
    if(this.exportForm.value.type != null) {
      match += `"type._id" : { "$oid" : "${this.exportForm.value.type}"},`
    }
    if(this.exportForm.value.employee != null) {
      match += `"employeeClosing._id" : { "$oid" : "${this.exportForm.value.employee}"},`
    }
    if(this.exportForm.value.branch != null) {
      match += `"branchDestination._id" : { "$oid" : "${this.exportForm.value.branch}"},`
    }
    
    match += `"type.transactionMovement": "${this.transactionMovement}", 
      "operationType": { "$ne": "D" }, 
      "type.operationType": { "$ne": "D" }, 
      "state" : "${TransactionState.Closed}",
      "endDate" : {"$gte": {"$date": "${this.exportForm.value.startDate}T00:00:00${timezone}"},"$lte": {"$date": "${this.exportForm.value.endDate}T23:59:59${timezone}"}} 
    }`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      "_id" : 1,
      origin: { $toString : "$origin" },
      letter: 1,
      number: { $toString : "$number" },
      "endDate": { $dateFromString: { dateString: { $dateToString: { date: "$endDate", timezone: timezone } }}},
      madein: 1,
      state: 1,
      observation: 1,
      discountAmount: { $toString : '$discountAmount' },
      totalPrice: { $toString : '$totalPrice' },
      operationType: 1,
      'company._id' :1,
      'company.name': 1,
      'company.emails' : 1,
      'employeeClosing._id' : 1,
      'employeeClosing.name': 1,
      'cashBox.number': { $toString : "$cashBox.number" },
      'type.transactionMovement': 1,
      'type._id' :1,
      'type.name': 1,
      'type.operationType': 1,
      'branchDestination._id': 1,
      'branchDestination.number': 1
    }

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        transactions: { $push: '$$ROOT' }
    };
    
    this._transactionService.getTransactionsV2(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        //this.itemsPerPage, // LIMIT
        //skip // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if (result && result[0] && result[0].transactions) {
          this.transactions = result[0].transactions;
          this.export();
        } else {
          this.showMessage("No se encontraron operaciones",'danger',true);
          this.transactions = new Array();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
   
  }

  public export() : void {

    let data = [] ;

    for (let index = 0; index < this.transactions.length; index++) {

      data[index] = {};
      data[index]['Fecha'] = moment(this.transactions[index].endDate).format('YYYY-MM-DD');
      data[index]['Tipo'] = this.transactions[index].type.name;
      data[index]['Origen'] = this.transactions[index].origin; 
      data[index]['Letra'] = this.transactions[index].letter;
      data[index]['N° Comprobante'] = this.transactions[index].number;
      if(this.transactions[index].company) {
        if(this.transactionMovement === TransactionMovement.Sale) {
          data[index]['Cliente'] = this.transactions[index].company.name
        } else {
          data[index]['Proveedor'] = this.transactions[index].company.name
        }
      } else {
        data[index]['Cliente'] = "Consumidor Final"
      }
      data[index]['Observación'] = this.transactions[index].observation
      data[index]['Total'] = this.roundNumber.transform(this.transactions[index].totalPrice)
      
    }
    this._companyService.exportAsExcelFile(data, this.transactionMovement.toString() +" de " + this.startDate + " a " + this.endDate);
  }

  public getCompanies() : void {
    
    this.loading = true;

    let type;

    if(this.transactionMovement === TransactionMovement.Sale) {
      type = CompanyType.Client
    } else {
      type = CompanyType.Provider
    }

    let query = 'where="type":"' + type.toString() + '"';

    this._companyService.getCompanies(query).subscribe(
        result => {
					if (!result.companies) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
					  this.companies = new Array();
					} else {
            this.hideMessage();
            this.loading = false;
            this.companies = result.companies;
          }
				},
				error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
				}
      );
  }

  public getTypes() : void {
    
    let query = `where="transactionMovement":"${this.transactionMovement}"`;
    
    this._transactionTypeService.getTransactionTypes(query).subscribe(
      result => {
        if (!result.transactionTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.types = result.transactionTypes;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getEmployees(): void {
    
    this._employeeService.getEmployees().subscribe(
      result => {
        if (!result.employees) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.employees = result.employees;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getBranches(): void {
    
    this.loading = true;
    
    this._branchesService.getBranches(
        { name: 1, operationType: 1, _id:1 }, // PROJECT
        { operationType: { $ne: 'D' } }, // MATCH
        { name: 1 }, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
    ).subscribe(
      result => {
        if (result && result.branches) {
          this.branches = result.branches;
        } else {
          this.branches = new Array();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
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
