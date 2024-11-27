import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';

import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Company, CompanyType } from 'app/components/company/company';
import { EmployeeService } from 'app/core/services/employee.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { DateFormatPipe } from '../../../core/pipes/date-format.pipe';
import { RoundNumberPipe } from '../../../core/pipes/round-number.pipe';
import { Config } from './../../../app.config';

import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Employee } from '@types';
import { CompanyGroup } from 'app/components/company-group/company-group';
import { TransactionType } from 'app/components/transaction-type/transaction-type';
import { Transaction } from 'app/components/transaction/transaction';
import { CompanyGroupService } from 'app/core/services/company-group.service';
import { CompanyService } from 'app/core/services/company.service';
import { ConfigService } from 'app/core/services/config.service';
import { MovementOfCashService } from 'app/core/services/movement-of-cash.service';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';

let splitRegex = /\r\n|\r|\n/g;
jsPDF.API['textEx'] = function (
  text: any,
  x: number,
  y: number,
  hAlign?: string,
  vAlign?: string
) {
  let fontSize = this.internal.getFontSize() / this.internal.scaleFactor;

  // As defined in jsPDF source code
  let lineHeightProportion = 1.5;

  let splittedText: string[];
  let lineCount: number = 1;
  if (
    vAlign === 'middle' ||
    vAlign === 'bottom' ||
    hAlign === 'center' ||
    hAlign === 'right'
  ) {
    splittedText = typeof text === 'string' ? text.split(splitRegex) : text;

    lineCount = splittedText.length || 1;
  }

  // Align the top
  y += fontSize * (2 - lineHeightProportion);

  if (vAlign === 'middle') y -= (lineCount / 2) * fontSize;
  else if (vAlign === 'bottom') y -= lineCount * fontSize;

  if (hAlign === 'center' || hAlign === 'right') {
    let alignSize = fontSize;
    if (hAlign === 'center') alignSize *= 0.5;

    if (lineCount > 1) {
      for (let iLine = 0; iLine < splittedText.length; iLine++) {
        this.text(
          splittedText[iLine],
          x - this.getStringUnitWidth(splittedText[iLine]) * alignSize,
          y
        );
        y += fontSize;
      }
      return this;
    }
    x -= this.getStringUnitWidth(text) * alignSize;
  }

  this.text(text, x, y);
  return this;
};
@Component({
  selector: 'app-current-account-details',
  templateUrl: './current-account-details.component.html',
  styleUrls: ['./current-account-details.component.css'],
})
export class CurrentAccountDetailsComponent implements OnInit {
  @Input() companyType: CompanyType;
  @Input() filterCompanyType;

  public searchCompanies = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap((term) =>
        this.getCompanies(term).then((makes) => {
          return makes;
        })
      ),
      tap(() => (this.loading = false))
    );

  public formatterCompanies = (x: { name: string }) => x.name;

  public companyForm: UntypedFormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public dateFormat = new DateFormatPipe();
  public doc;
  public pdfURL;
  public config;
  public hasChanged = false;
  public roundNumber = new RoundNumberPipe();
  public pageWidth: number;
  public pageHigh: number;
  public withImage: boolean = false;
  public items = [];
  public employees: Employee[];
  public companyGroups: CompanyGroup[];
  public Client;
  public Provider;
  public fontSizes = JSON.parse(`{"xsmall" : 5,
                                  "small" : 7,
                                  "normal" : 10,
                                  "large" : 15,
                                  "extraLarge" : 20}`);

  public formErrors = {};

  public validationMessages = {};

  public transactionTypes: TransactionType[];
  public transactionTypesSelect;
  public dropdownSettings = {
    singleSelection: false,
    defaultOpen: false,
    idField: '_id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableCheckAll: true,
    itemsShowLimit: 1,
    allowSearchFilter: true,
  };

  public startDate: string;
  public endDate: string;
  public employee;
  public withDetails;
  public companyGroup: string;

  constructor(
    public _transactionService: TransactionService,
    public _movementOfCashService: MovementOfCashService,
    public _configService: ConfigService,
    public _transactionTypeService: TransactionTypeService,
    public _employeeService: EmployeeService,
    public _companyGroup: CompanyGroupService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public _companyService: CompanyService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private domSanitizer: DomSanitizer
  ) {
    this.transactionTypesSelect = new Array();
    this.pageWidth = 210;
    this.pageHigh = 297;
    this.getEmployees();
    this.getGroups();
  }

  async ngOnInit() {
    await this._configService.getConfig.subscribe((config) => {
      this.config = config;
    });

    await this.getTransactionTypes().then((result) => {
      if (result) {
        this.transactionTypes = result;
      }
    });

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.doc = new jsPDF('p', 'mm', [this.pageWidth, this.pageHigh]);
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {
    this.companyForm = this._fb.group({
      address: ['', []],
      emails: ['', []],
      company: ['', []],
      employee: ['', []],
      companyGroup: ['', []],
      withDetails: [false, [Validators.required]],
    });

    this.companyForm.valueChanges.subscribe((data) =>
      this.onValueChanged(data)
    );

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {
    if (!this.companyForm) {
      return;
    }
    const form = this.companyForm;

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

  public getTransactions(): void {
    this.loading = true;

    let timezone = '-03:00';
    if (Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

    let query = [];

    query.push(
      {
        $lookup: {
          from: 'transaction-types',
          foreignField: '_id',
          localField: 'type',
          as: 'type',
        },
      },
      {
        $unwind: {
          path: '$type',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'companies',
          foreignField: '_id',
          localField: 'company',
          as: 'company',
        },
      },
      {
        $unwind: {
          path: '$company',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'vat-conditions',
          foreignField: '_id',
          localField: 'company.vatCondition',
          as: 'company.vatCondition',
        },
      },
      {
        $unwind: {
          path: '$company.vatCondition',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'identification-types',
          foreignField: '_id',
          localField: 'company.identificationType',
          as: 'company.identificationType',
        },
      },
      {
        $unwind: {
          path: '$company.identificationType',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'employees',
          foreignField: '_id',
          localField: 'company.employee',
          as: 'company.employee',
        },
      },
      {
        $unwind: {
          path: '$company.employee',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'states',
          foreignField: '_id',
          localField: 'company.state',
          as: 'company.state',
        },
      },
      {
        $unwind: {
          path: '$company.state',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'company-groups',
          foreignField: '_id',
          localField: 'company.group',
          as: 'company.group',
        },
      },
      {
        $unwind: {
          path: '$company.group',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          'company._id': 1,
          'company.name': 1,
          'company.address': 1,
          'company.city': 1,
          'company.phones': 1,
          'company.emails': 1,
          'company.type': 1,
          'company.group': 1,
          'company.identificationType.name': 1,
          'company.identificationValue': 1,
          'company.vatCondition.description': 1,
          'company.employee._id': 1,
          'company.employee.name': 1,
          'company.operationType': 1,
          'company.state.name': 1,
          endDate: 1,
          endDate2: {
            $dateToString: {
              date: '$endDate',
              format: '%d/%m/%Y',
              timezone: timezone,
            },
          },
          'type.name': 1,
          'type.currentAccount': 1,
          'type.movement': 1,
          number: 1,
          letter: 1,
          origin: 1,
          expirationDate: {
            $dateToString: {
              date: '$expirationDate',
              format: '%d/%m/%Y',
              timezone: timezone,
            },
          },
          state: 1,
          balance: 1,
          operationType: 1,
          'type.labelPrint': 1,
          totalPrice: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      {
                        $eq: [this.companyType, 'Cliente'],
                      },
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewClient,
                          false,
                        ],
                      },
                      {
                        $eq: ['$type.movement', 'Entrada'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Si'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', 1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [this.companyType, 'Cliente'],
                      },
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewClient,
                          false,
                        ],
                      },
                      {
                        $eq: ['$type.movement', 'Salida'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Si'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', -1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewClient,
                          false,
                        ],
                      },
                      {
                        $eq: [this.companyType, 'Cliente'],
                      },
                      {
                        $eq: ['$type.movement', 'Entrada'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Cobra'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', -1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewClient,
                          false,
                        ],
                      },
                      {
                        $eq: [this.companyType, 'Cliente'],
                      },
                      {
                        $eq: ['$type.movement', 'Salida'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Cobra'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', 1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [this.companyType, 'Cliente'],
                      },
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewClient,
                          true,
                        ],
                      },
                      {
                        $eq: ['$type.movement', 'Entrada'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Si'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', -1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [this.companyType, 'Cliente'],
                      },
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewClient,
                          true,
                        ],
                      },
                      {
                        $eq: ['$type.movement', 'Salida'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Si'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', 1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewClient,
                          true,
                        ],
                      },
                      {
                        $eq: [this.companyType, 'Cliente'],
                      },
                      {
                        $eq: ['$type.movement', 'Entrada'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Cobra'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', 1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewClient,
                          true,
                        ],
                      },
                      {
                        $eq: [this.companyType, 'Cliente'],
                      },
                      {
                        $eq: ['$type.movement', 'Salida'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Cobra'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', -1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [this.companyType, 'Proveedor'],
                      },
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewProvider,
                          false,
                        ],
                      },
                      {
                        $eq: ['$type.movement', 'Entrada'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Si'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', -1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [this.companyType, 'Proveedor'],
                      },
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewProvider,
                          false,
                        ],
                      },
                      {
                        $eq: ['$type.movement', 'Salida'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Si'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', 1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewProvider,
                          false,
                        ],
                      },
                      {
                        $eq: [this.companyType, 'Proveedor'],
                      },
                      {
                        $eq: ['$type.movement', 'Entrada'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Cobra'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', 1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewProvider,
                          false,
                        ],
                      },
                      {
                        $eq: [this.companyType, 'Proveedor'],
                      },
                      {
                        $eq: ['$type.movement', 'Salida'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Cobra'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', -1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [this.companyType, 'Proveedor'],
                      },
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewProvider,
                          true,
                        ],
                      },
                      {
                        $eq: ['$type.movement', 'Entrada'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Si'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', 1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [this.companyType, 'Proveedor'],
                      },
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewProvider,
                          true,
                        ],
                      },
                      {
                        $eq: ['$type.movement', 'Salida'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Si'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', -1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewProvider,
                          true,
                        ],
                      },
                      {
                        $eq: [this.companyType, 'Proveedor'],
                      },
                      {
                        $eq: ['$type.movement', 'Entrada'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Cobra'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', -1],
                  },
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          this.config.reports.summaryOfAccounts
                            .invertedViewProvider,
                          true,
                        ],
                      },
                      {
                        $eq: [this.companyType, 'Proveedor'],
                      },
                      {
                        $eq: ['$type.movement', 'Salida'],
                      },
                      {
                        $eq: ['$type.currentAccount', 'Cobra'],
                      },
                    ],
                  },
                  then: {
                    $multiply: ['$totalPrice', 1],
                  },
                },
              ],
              default: 0,
            },
          },
        },
      }
    );

    let match = `{`;

    if (this.companyForm.value.company) {
      match += `"company._id": { "$oid" : "${this.companyForm.value.company._id}"},`;
    }
    if (this.companyForm.value.employee) {
      match += `"company.employee._id": { "$oid" : "${this.companyForm.value.employee}"},`;
    }

    if (this.companyGroup) {
      match += `"company.group" : { "$oid" : "${this.companyGroup}" },`;
    }

    if (this.companyForm.value.endDate) {
      let timezone = '-03:00';
      if (Config.timezone && Config.timezone !== '') {
        timezone = Config.timezone.split('UTC')[1];
      }

      match += `"transaction.endDate" : { "$lte": {"$date": "${this.companyForm.value.endDate}T23:59:59${timezone}"}},`;
    }

    match += `  "balance" : { "$gt" : 10 },`;
    match += `  "company.type" : "${this.companyType}",
                    "state" : "Cerrado",       
                    "type.currentAccount" : { "$ne" : "No"},   
                    "company.operationType" : { "$ne" : "D" },
                    "operationType" : { "$ne" : "D" } }`;

    match = JSON.parse(match);

    query.push({ $match: match });

    query.push(
      {
        $group: {
          _id: {
            company: '$company',
          },
          transactions: {
            $push: '$$ROOT',
          },
          count: {
            $sum: 1,
          },
          price: {
            $sum: '$totalPrice',
          },
          balance: {
            $sum: '$balance',
          },
        },
      },
      {
        $sort: {
          '_id.company.name': 1,
          'transactions.endDate': 1,
        },
      }
    );

    this._transactionService.getTransactionsV3(query).subscribe(
      (result) => {
        if (result) {
          this.items = result;
          this.print();
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public print(): void {
    let page = 1;
    let row = 15;
    this.doc.setFontSize(this.fontSizes.extraLarge);
    this.doc.text(5, row, 'Resumen de cuenta de ' + this.companyType);
    row += 5;
    this.doc.setFontSize(this.fontSizes.large);
    this.doc.text(180, 280, 'Hoja:' + page);
    for (let i = 0; i < this.items.length; i++) {
      this.doc.setLineWidth(1);
      this.doc.line(0, row, 1000, row);
      row += 5;
      this.doc.setFontSize(this.fontSizes.large);
      this.doc.text(5, row, this.items[i]._id.company.name);

      if (this.items[i]._id.company.group) {
        this.doc.text(150, row, this.items[i]._id.company.group.description);
      } else {
        this.doc.text(150, row, 'sin grupo');
      }

      row += 5;
      this.doc.setFontSize(this.fontSizes.normal);
      if (
        this.items[i]._id.company.identificationType &&
        this.items[i]._id.company.identificationValue
      ) {
        this.doc.text(
          5,
          row,
          this.items[i]._id.company.identificationType.name +
            ':' +
            this.items[i]._id.company.identificationValue
        );
      }
      if (Config.country === 'AR') {
        this.doc.text(100, row, 'Condición de IVA:');
        if (this.items[i]._id.company.vatCondition) {
          this.doc.text(
            100 + 30,
            row,
            this.items[i]._id.company.vatCondition.description
          );
        }
      } else {
        this.doc.text(100, row, 'Régimen Fiscal:');
        if (this.items[i]._id.company.vatCondition) {
          this.doc.text(
            100 + 30,
            row,
            +this.items[i]._id.company.vatCondition.description
          );
        }
      }
      row += 5;
      this.doc.text(5, row, 'Dirección:');
      if (this.items[i]._id.company.address) {
        this.doc.text(5 + 20, row, this.items[i]._id.company.address);
      }
      this.doc.text(100, row, 'Ciudad:');
      if (this.items[i]._id.company.city) {
        this.doc.text(100 + 20, row, this.items[i]._id.company.city);
      }
      row += 5;
      this.doc.text(5, row, 'Provincia:');
      if (this.items[i]._id.company.state) {
        this.doc.text(5 + 20, row, this.items[i]._id.company.state.name);
      }
      this.doc.text(100, row, 'Teléfono:');
      if (this.items[i]._id.company.phones) {
        this.doc.text(100 + 20, row, this.items[i]._id.company.phones);
      }

      row += 5;
      this.doc.setLineWidth(0.5);
      this.doc.line(0, row, 1000, row);
      row += 5;
      if (this.withDetails) {
        this.doc.text(5, row, 'Fecha');
        this.doc.text(30, row, 'Tipo');
        this.doc.text(75, row, 'Comprobante');
        this.doc.text(110, row, 'Vencimiento');
        this.doc.text(140, row, 'Importe');
        this.doc.text(165, row, 'Saldo');
        this.doc.text(190, row, 'Saldo Acum.');
        row += 3;
        this.doc.setLineWidth(0.5);
        this.doc.line(0, row, 1000, row);
        row += 5;
      }

      let acumulado = 0;
      for (let transaction of this.items[i].transactions) {
        if (this.withDetails) {
          this.doc.text(5, row, transaction['endDate2']);
          if (transaction.type.labelPrint) {
            this.doc.text(30, row, transaction.type.labelPrint);
          } else {
            this.doc.text(30, row, transaction.type.name);
          }
          let comprobante = '';
          if (transaction.origin) {
            comprobante += this.padString(transaction.origin, 4) + '-';
          }
          if (transaction.letter) {
            comprobante += transaction.letter + '-';
          }
          if (transaction.number) {
            comprobante += this.padString(transaction.number, 8);
          }
          this.doc.text(75, row, comprobante);
          if (transaction.expirationDate) {
            this.doc.text(110, row, transaction.expirationDate);
          }
          this.doc.textEx(
            '$ ' +
              this.roundNumber
                .transform(transaction.totalPrice)
                .toFixed(2)
                .toString(),
            155,
            row,
            'right',
            'middle'
          );
          this.doc.textEx(
            '$ ' +
              this.roundNumber
                .transform(
                  transaction.balance * Math.sign(transaction.totalPrice)
                )
                .toFixed(2)
                .toString(),
            180,
            row,
            'right',
            'middle'
          );
          acumulado =
            acumulado + transaction.balance * Math.sign(transaction.totalPrice);
          this.doc.textEx(
            '$ ' + this.roundNumber.transform(acumulado).toFixed(2).toString(),
            205,
            row,
            'right',
            'middle'
          );
          row += 5;
        } else {
          acumulado =
            acumulado + transaction.balance * Math.sign(transaction.totalPrice);
        }

        if (row > 200) {
          page += 1;
          this.doc.addPage();
          this.doc.setFontSize(this.fontSizes.large);
          this.doc.text(180, 280, 'Hoja:' + page);
          this.doc.setFontSize(this.fontSizes.normal);
          row = 15;
        }
      }

      this.doc.setFont('', 'bold');
      this.doc.text(120, row, 'Total');
      this.doc.textEx(
        '$ ' + this.roundNumber.transform(acumulado).toFixed(2).toString(),
        180,
        row,
        'right',
        'middle'
      );

      this.doc.setFont('', 'normal');
      row += 5;
      if (row > 220) {
        page += 1;
        this.doc.addPage();
        this.doc.setFontSize(this.fontSizes.large);
        this.doc.text(180, 280, 'Hoja:' + page);
        this.doc.setFontSize(this.fontSizes.normal);

        row = 15;
      }
    }
    this.finishImpression();
  }

  public getMovementOfCash(): Promise<[]> {
    return new Promise<[]>((resolve, reject) => {
      this.loading = true;

      let timezone = '-03:00';
      if (Config.timezone && Config.timezone !== '') {
        timezone = Config.timezone.split('UTC')[1];
      }

      let fullQuery = [];

      fullQuery.push(
        {
          $lookup: {
            from: 'payment-methods',
            foreignField: '_id',
            localField: 'type',
            as: 'type',
          },
        },
        { $unwind: { path: '$type' } },
        {
          $lookup: {
            from: 'transactions',
            foreignField: '_id',
            localField: 'transaction',
            as: 'transaction',
          },
        },
        { $unwind: { path: '$transaction' } },
        {
          $lookup: {
            from: 'transaction-types',
            foreignField: '_id',
            localField: 'transaction.type',
            as: 'transaction.type',
          },
        },
        { $unwind: { path: '$transaction.type' } },
        {
          $lookup: {
            from: 'companies',
            foreignField: '_id',
            localField: 'transaction.company',
            as: 'transaction.company',
          },
        },
        {
          $unwind: {
            path: '$transaction.company',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'states',
            foreignField: '_id',
            localField: 'transaction.company.state',
            as: 'transaction.company.state',
          },
        },
        {
          $unwind: {
            path: '$transaction.company.state',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'employees',
            foreignField: '_id',
            localField: 'transaction.company.employee',
            as: 'transaction.company.employee',
          },
        },
        {
          $unwind: {
            path: '$transaction.company.employee',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'identification-types',
            foreignField: '_id',
            localField: 'transaction.company.identificationType',
            as: 'transaction.company.identificationType',
          },
        },
        {
          $unwind: {
            path: '$transaction.company.identificationType',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'vat-conditions',
            foreignField: '_id',
            localField: 'transaction.company.vatCondition',
            as: 'transaction.company.vatCondition',
          },
        },
        {
          $unwind: {
            path: '$transaction.company.vatCondition',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            'type.isCurrentAccount': 1,
            'transaction._id': 1,
            'transaction.company._id': 1,
            'transaction.company.name': 1,
            'transaction.company.type': 1,
            'transaction.company.address': 1,
            'transaction.company.city': 1,
            'transaction.company.phones': 1,
            'transaction.company.emails': 1,
            'transaction.company.identificationType.name': 1,
            'transaction.company.identificationValue': 1,
            'transaction.company.vatCondition.description': 1,
            'transaction.company.employee._id': 1,
            'transaction.company.employee.name': 1,
            'transaction.company.operationType': 1,
            'transaction.company.state.name': 1,
            'transaction.company.group': 1,
            'transaction.type.currentAccount': 1,
            'transaction.type.movement': 1,
            'transaction.type.labelPrint': 1,
            'transaction.type.name': 1,
            'transaction.type._id': 1,
            'transaction.state': 1,
            'transaction.operationType': 1,
            'transaction.number': 1,
            'transaction.origin': 1,
            'transaction.letter': 1,
            'trasaction.expirationDate': 1,
            'transaction.endDate': 1,
            'transaction.endDate2': {
              $dateToString: {
                date: '$transaction.endDate',
                format: '%d/%m/%Y',
                timezone: timezone,
              },
            },
            operationType: 1,
            amountPaid: {
              $switch: {
                branches: [
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            false,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            false,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            false,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            false,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            true,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            true,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            true,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            true,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            false,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            false,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            false,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            false,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            true,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            true,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            true,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            true,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$amountPaid', 1],
                    },
                  },
                ],
                default: 0,
              },
            },
            'transaction.totalPrice': {
              $switch: {
                branches: [
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            false,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            false,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            false,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            false,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            true,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            true,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            true,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewClient,
                            true,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Cliente'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            false,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            false,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            false,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            false,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            true,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', 1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            true,
                          ],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Si'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            true,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Entrada'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', -1],
                    },
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            this.config.reports.summaryOfAccounts
                              .invertedViewProvider,
                            true,
                          ],
                        },
                        {
                          $eq: [this.companyType, 'Proveedor'],
                        },
                        {
                          $eq: ['$transaction.type.movement', 'Salida'],
                        },
                        {
                          $eq: ['$transaction.type.currentAccount', 'Cobra'],
                        },
                      ],
                    },
                    then: {
                      $multiply: ['$transaction.totalPrice', 1],
                    },
                  },
                ],
                default: 0,
              },
            },
          },
        }
      );

      let match = `{`;

      if (this.employee) {
        match += `"transaction.company.employee._id": { "$oid" : "${this.employee}"},`;
      }

      if (this.companyGroup) {
        match += `"transaction.company.group" : { "$oid" : "${this.companyGroup}" },`;
      }

      if (this.startDate && this.endDate) {
        let timezone = '-03:00';
        if (Config.timezone && Config.timezone !== '') {
          timezone = Config.timezone.split('UTC')[1];
        }

        match += `"transaction.endDate" : { "$gte": {"$date": "${this.startDate}T00:00:00${timezone}" }, "$lte": {"$date": "${this.endDate}T23:59:59${timezone}"} },`;

        /*match += `"transaction.endDate" : { "$gte": {"$date": "${this.startDate}T00:00:00${timezone}"}},`
                match += `"transaction.endDate" : { "$lte": {"$date": "${this.endDate}T23:59:59${timezone}"}},`*/
      }

      match += `  "$or": [{ "type.isCurrentAccount": true }, { "transaction.type.currentAccount": "Cobra" }],
                        "transaction.state": "Cerrado",
                        "transaction.company.type": "${this.companyType}",
                        "transaction.operationType": { "$ne": "D" },
                        "transaction.company.operationType": {"$ne": "D"},
                        "operationType" : { "$ne" : "D" } }`;

      match = JSON.parse(match);

      let transactionTypes = [];

      if (this.transactionTypesSelect) {
        this.transactionTypesSelect.forEach((element) => {
          transactionTypes.push({ $oid: element._id });
        });
        match['transaction.type._id'] = { $in: transactionTypes };
      }

      fullQuery.push({ $match: match });

      fullQuery.push(
        {
          $group: {
            _id: { transactions: '$transaction' },
            //"transactions": { $push: "$transaction" }
            totalPrice: { $sum: '$amountPaid' },
          },
        },
        {
          $sort: {
            '_id.transactions.endDate': 1,
          },
        },
        {
          $group: {
            _id: { company: '$_id.transactions.company' },
            transactions: { $push: '$_id.transactions' },
            balance: { $sum: '$totalPrice' },
          },
        },
        {
          $sort: {
            '_id.company.name': 1,
          },
        }
      );

      this._movementOfCashService.getMovementsOfCashesV3(fullQuery).subscribe(
        (result) => {
          if (result && result.length > 0) {
            resolve(result);
            this.loading = false;
          } else {
            this.showMessage('No se encontraron transacciones', 'info', true);
          }
        },
        (error) => {
          resolve(null);
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    });
  }

  async print2() {
    this.items = await this.getMovementOfCash();

    let page = 1;
    let row = 15;
    this.doc.setFontSize(this.fontSizes.extraLarge);
    this.doc.text(5, row, 'Resumen de cuenta de ' + this.companyType);
    row += 5;
    this.doc.setFontSize(this.fontSizes.large);
    this.doc.text(180, 280, 'Hoja:' + page);
    let total = 0;
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].price !== 0) {
        this.doc.setLineWidth(1);
        this.doc.line(0, row, 1000, row);
        row += 5;
        this.doc.setFontSize(this.fontSizes.large);
        this.doc.text(5, row, this.items[i]._id.company.name);
        row += 5;
        this.doc.setFontSize(this.fontSizes.normal);
        if (
          this.items[i]._id.company.identificationType &&
          this.items[i]._id.company.identificationValue
        ) {
          this.doc.text(
            5,
            row,
            this.items[i]._id.company.identificationType.name +
              ':' +
              this.items[i]._id.company.identificationValue
          );
        }
        if (Config.country === 'AR') {
          this.doc.text(100, row, 'Condición de IVA:');
          if (this.items[i]._id.company.vatCondition) {
            this.doc.text(
              100 + 30,
              row,
              this.items[i]._id.company.vatCondition.description
            );
          }
        } else {
          this.doc.text(100, row, 'Régimen Fiscal:');
          if (this.items[i]._id.company.vatCondition) {
            this.doc.text(
              100 + 30,
              row,
              +this.items[i]._id.company.vatCondition.description
            );
          }
        }
        row += 5;
        this.doc.text(5, row, 'Dirección:');
        if (this.items[i]._id.company.address) {
          this.doc.text(5 + 20, row, this.items[i]._id.company.address);
        }
        this.doc.text(100, row, 'Ciudad:');
        if (this.items[i]._id.company.city) {
          this.doc.text(100 + 20, row, this.items[i]._id.company.city);
        }
        row += 5;
        this.doc.text(5, row, 'Provincia:');
        if (this.items[i]._id.company.state) {
          this.doc.text(5 + 20, row, this.items[i]._id.company.state.name);
        }
        this.doc.text(100, row, 'Teléfono:');
        if (this.items[i]._id.company.phones) {
          this.doc.text(100 + 20, row, this.items[i]._id.company.phones);
        }

        row += 5;
        this.doc.setLineWidth(0.5);
        this.doc.line(0, row, 1000, row);
        row += 5;
        if (this.withDetails) {
          this.doc.text(5, row, 'Fecha');
          this.doc.text(30, row, 'Tipo');
          this.doc.text(75, row, 'Comprobante');
          this.doc.text(110, row, 'Vencimiento');
          this.doc.text(140, row, 'Importe');
          row += 3;
          this.doc.setLineWidth(0.5);
          this.doc.line(0, row, 1000, row);
          row += 5;
        }

        let acumulado = 0;
        if (this.withDetails) {
          for (let transaction of this.items[i].transactions) {
            if (this.withDetails) {
              this.doc.text(5, row, transaction['endDate2']);
              if (transaction.type.labelPrint) {
                this.doc.text(30, row, transaction.type.labelPrint);
              } else {
                this.doc.text(30, row, transaction.type.name);
              }
              let comprobante = '';
              if (transaction.origin) {
                comprobante += this.padString(transaction.origin, 4) + '-';
              }
              if (transaction.letter) {
                comprobante += transaction.letter + '-';
              }
              if (transaction.number) {
                comprobante += this.padString(transaction.number, 8);
              }
              this.doc.text(75, row, comprobante);
              if (transaction.expirationDate) {
                this.doc.text(110, row, transaction.expirationDate);
              }
            }

            this.doc.textEx(
              '$ ' +
                this.roundNumber
                  .transform(transaction.totalPrice)
                  .toFixed(2)
                  .toString(),
              155,
              row,
              'right',
              'middle'
            );
            row += 5;

            if (row > 200) {
              page += 1;
              this.doc.addPage();
              this.doc.setFontSize(this.fontSizes.large);
              this.doc.text(180, 280, 'Hoja:' + page);
              this.doc.setFontSize(this.fontSizes.normal);
              row = 15;
            }
          }
        }

        this.doc.setFont('', 'bold');
        this.doc.text(120, row, 'Total');
        this.doc.textEx(
          '$ ' +
            this.roundNumber
              .transform(this.items[i].price)
              .toFixed(2)
              .toString(),
          155,
          row,
          'right',
          'middle'
        );
        total = total + this.items[i].price;

        this.doc.setFont('', 'normal');
        row += 5;
        if (row > 220) {
          page += 1;
          this.doc.addPage();
          this.doc.setFontSize(this.fontSizes.large);
          this.doc.text(180, 280, 'Hoja:' + page);
          this.doc.setFontSize(this.fontSizes.normal);

          row = 15;
        }
      }
    }

    row += 8;
    this.doc.setFontSize(this.fontSizes.extraLarge);
    this.doc.text(
      120,
      row,
      'Total : $ ' + this.roundNumber.transform(total).toFixed(2).toString()
    );

    this.finishImpression();
  }
  async endDateTransactions(transaction: Transaction[]): Promise<string> {
    return new Promise((resolve, reject) => {
      let maxDate: string = '0';
      transaction
        .filter((e) => e.endDate)
        .forEach((e) => {
          Date.parse(maxDate.slice(0, 10)) < Date.parse(e.endDate.slice(0, 10))
            ? (maxDate = e.endDate)
            : null;
        });
      resolve(maxDate.slice(0, 10));
    });
  }
  async printTotalExcel() {
    this.loading = true;
    let data: any = [];
    let items = await this.getMovementOfCash();
    let y = 0;
    for (let i = 0; i < items.length; i++) {
      if (
        this.roundNumber.transform(items[i]['balance']).toFixed(2) !== '0.00'
      ) {
        data[y] = {};
        let company: Company = items[i]['_id']['company'];

        data[y]['Nombre'] = company.name;
        data[y]['Condición de IVA'] = company.vatCondition
          ? company.vatCondition.description
          : '';
        data[y]['Identificación'] = company.identificationValue;
        data[y]['Ciudad'] = company.city;
        data[y]['Dirección'] = company.address;
        data[y]['Telefono'] = company.phones;
        data[y]['Correo'] = company.emails;
        if (company.employee) {
          data[y]['Empleado'] = company.employee.name;
        } else {
          data[y]['Empleado'] = '';
        }

        data[y]['Balance'] = this.roundNumber
          .transform(items[i]['balance'])
          .toFixed(2);
        data[y]['Balance'] = parseFloat(data[y]['Balance'].replace('.', ','));

        if (items[i]['transactions']) {
          // recorrer transaction y buscar el endate mas nuevo
          data[y]['Ultimo movimiento'] = await this.endDateTransactions(
            items[i]['transactions']
          );
        }
        y++;
        if (this.withDetails) {
          y++;
          for (let t = 0; t < items[i]['transactions']['length']; t++) {
            const element = items[i]['transactions'][t];
            const type: TransactionType = element['type'];

            data[y] = {};
            data[y]['Nombre'] = '';
            data[y]['Nombre'] = '';
            data[y]['Condición de IVA'] = '';
            data[y]['Identificación'] = '';
            data[y]['Ciudad'] = type.name;
            data[y]['Dirección'] = element['endDate2'];
            data[y]['Telefono'] = element['origin'];
            data[y]['Correo'] = element['letter'];
            data[y]['Empleado'] = element['number'];
            data[y]['Balance'] = element['totalPrice'];

            y++;
          }
          y++;
        }
      }
    }
    this.loading = false;
    this._companyService.exportAsExcelFile(
      data,
      'Resumen de Cuenta de' + this.companyType
    );
  }

  public finishImpression(): void {
    this.doc.autoPrint();
    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(
      this.doc.output('bloburl')
    );
    this.doc = new jsPDF('l', 'mm', [this.pageWidth, this.pageHigh]);
  }

  public centerText(lMargin, rMargin, pdfInMM, startPdf, height, text): void {
    if (text) {
      let pageCenter = pdfInMM / 2;

      let lines = this.doc.splitTextToSize(text, pdfInMM - lMargin - rMargin);
      let dim = this.doc.getTextDimensions(text);
      let lineHeight = dim.h;
      if (lines && lines.length > 0) {
        for (let i = 0; i < lines.length; i++) {
          let lineTop = (lineHeight / 2) * i;
          this.doc.text(text, pageCenter + startPdf, height, lineTop, 'center');
        }
      }
    }
  }

  public closeModal() {
    this.activeModal.close(this.hasChanged);
  }

  public padString(n, length) {
    n = n.toString();
    while (n.length < length) n = '0' + n;
    return n;
  }

  public getEmployees(): void {
    this._employeeService.getEmployees().subscribe(
      (result) => {
        if (result && result.employees) {
          this.employees = result.employees;
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getCompanies(term: string) {
    let project = {
      name: 1,
      type: 1,
      operationType: 1,
    };

    let match = `{
            "name" : { "$regex": "${term}", "$options": "i" },
            "type" : "${this.companyType}",
            "operationType" : { "$ne": "D" }
        }`;

    match = JSON.parse(match);

    return new Promise((resolve, reject) => {
      this._companyService
        .getCompaniesV2(project, match, { name: 1 }, {}, 10)
        .subscribe(
          (result) => {
            if (result.companies) {
              resolve(result.companies);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            this.loading = false;
          }
        );
    });
  }

  public getGroups() {
    let project = {
      description: 1,
      operationType: 1,
    };

    let match = {
      operationType: { $ne: 'D' },
    };

    this._companyGroup
      .getAll({
        project: project,
        match: match,
        sort: { description: 1 },
        limit: 10,
      })
      .subscribe(
        (result) => {
          if (result && result.status === 200) {
            this.companyGroups = result.result;
          } else {
            this.companyGroups = [];
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  public getTransactionTypes(): Promise<TransactionType[]> {
    return new Promise<TransactionType[]>((resolve, reject) => {
      let transactionMovement;
      if (this.companyType === CompanyType.Client)
        transactionMovement = 'Venta';
      if (this.companyType === CompanyType.Provider)
        transactionMovement = 'Compra';

      let match = {};

      match = {
        transactionMovement: transactionMovement,
        $or: [{ currentAccount: 'Si' }, { currentAccount: 'Cobra' }],
      };

      this._transactionTypeService
        .getAll({
          project: {
            _id: 1,
            transactionMovement: 1,
            operationType: 1,
            name: 1,
            currentAccount: 1,
            branch: 1,
          },
          match: match,
        })
        .subscribe(
          (result) => {
            if (result) {
              resolve(result.result);
              this.transactionTypesSelect = result.result;
            } else {
              resolve(null);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          }
        );
    });
  }

  onItemSelect(item: any) {}

  onSelectAll(items: any) {}

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
