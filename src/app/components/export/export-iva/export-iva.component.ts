import {Component, OnInit, Input} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NgbModal, NgbActiveModal, NgbAlertConfig} from '@ng-bootstrap/ng-bootstrap';
import {Branch} from 'app/components/branch/branch';
import {BranchService} from 'app/components/branch/branch.service';
import {Classification} from 'app/components/classification/classification';
import {ClassificationService} from 'app/components/classification/classification.service';
import {PrintVatBookComponent} from 'app/components/print/print-vat-book/print-vat-book.component';
import {State} from 'app/components/state/state';
import {StateService} from 'app/components/state/state.service';
import {TaxClassification, Tax} from 'app/components/tax/tax';
import {TaxService} from 'app/components/tax/tax.service';
import {Taxes} from 'app/components/tax/taxes';
import {
  Movements,
  TransactionMovement,
} from 'app/components/transaction-type/transaction-type';
import {VATCondition} from 'app/components/vat-condition/vat-condition';
import {VATConditionService} from 'app/components/vat-condition/vat-condition.service';
import {DateFormatPipe} from 'app/main/pipes/date-format.pipe';
import {RoundNumberPipe} from 'app/main/pipes/round-number.pipe';
import * as moment from 'moment';

import {CompanyService} from '../../company/company.service';
import {TransactionService} from '../../transaction/transaction.service';

import 'moment/locale/es';

@Component({
  selector: 'app-export-iva',
  templateUrl: './export-iva.component.html',
  styleUrls: ['./export-iva.component.css'],
})
export class ExportIvaComponent implements OnInit {
  @Input() type: string;

  public exportIVAForm: UntypedFormGroup;
  
  public dataIVA: any = [];
  public dataState: any = [];
  public dataClassification: any = [];

  public vatConditions: VATCondition[];
  public states: State[];
  public taxes: Tax[];
  public dataTaxes: any[];
  public classifications: Classification[];
  public branches: Branch[];
  
  public alertMessage: string = '';
  public loading: boolean = false;
  public VATPeriod: string;
  public dateFormat = new DateFormatPipe();
  public roundNumber = new RoundNumberPipe();

  constructor(
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public _transactionService: TransactionService,
    public _vatConditionService: VATConditionService,
    public _stateService: StateService,
    public _classificationService: ClassificationService,
    public _branchesService: BranchService,
    public _taxesService: TaxService,
    public _companyService: CompanyService,
  ) {
    this.getVATConditions();
    this.getStates();
    this.getTaxes();
    this.getClassifications();
    this.getBranches();
  }

  ngOnInit() {
    this.buildForm();
  }

  public getStates(): void {
    this.loading = true;

    let project = {
      _id: 1,
      name: 1,
    };

    let match = {
      'operationType ': {$ne: 'D'},
    };

    this._stateService.getStates(project, match, {}, {}).subscribe(
      (result) => {
        if (!result.states) {
        } else {
          this.states = result.states;
          for (let index = 0; index < this.states.length; index++) {
            this.dataState[index] = {};
            this.dataState[index]['_id'] = this.states[index]._id;
            this.dataState[index]['name'] = this.states[index].name;
            this.dataState[index]['gravado'] = 0;
            this.dataState[index]['iva10'] = 0;
            this.dataState[index]['iva21'] = 0;
            this.dataState[index]['iva27'] = 0;
          }
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      },
    );
  }

  public getVATConditions(): void {
    this.loading = true;

    this._vatConditionService.getVATConditions().subscribe(
      (result) => {
        if (!result.vatConditions) {
        } else {
          this.vatConditions = result.vatConditions;
          for (let index = 0; index < this.vatConditions.length; index++) {
            this.dataIVA[index] = {};
            this.dataIVA[index]['_id'] = this.vatConditions[index]._id;
            this.dataIVA[index]['description'] = this.vatConditions[index].description;
            this.dataIVA[index]['iva10'] = 0;
            this.dataIVA[index]['iva21'] = 0;
            this.dataIVA[index]['iva27'] = 0;
          }
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      },
    );
  }

  public getClassifications(): void {
    let match = `{"operationType": { "$ne": "D" } }`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      name: 1,
      operationType: 1,
    };

    // AGRUPAMOS EL RESULTADO
    let group = {
      _id: null,
      count: {$sum: 1},
      classifications: {$push: '$$ROOT'},
    };

    this._classificationService
      .getClassifications(
        project, // PROJECT
        match, // MATCH
        {}, // SORT
        group, // GROUP
        0, // LIMIT
        0, // SKIP
      )
      .subscribe(
        (result) => {
          this.loading = false;
          if (result && result[0] && result[0].classifications) {
            this.classifications = result[0].classifications;
            for (let index = 0; index < this.classifications.length; index++) {
              this.dataClassification[index] = {};
              this.dataClassification[index]['_id'] = this.classifications[index]._id;
              this.dataClassification[index]['name'] = this.classifications[index].name;

              this.dataClassification[index]['gravado'] = 0;
              this.dataClassification[index]['iva'] = 0;
            }
          } else {
            this.dataClassification = new Array();
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        },
      );
  }

  public getTaxes(): void {
    let match = `{"operationType": { "$ne": "D" }}`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      name: 1,
      operationType: 1,
      classification: 1,
    };

    // AGRUPAMOS EL RESULTADO
    let group = {
      _id: null,
      count: {$sum: 1},
      taxes: {$push: '$$ROOT'},
    };

    this._taxesService
      .getTaxesV2(
        project, // PROJECT
        match, // MATCH
        {}, // SORT
        group, // GROUP
        0, // LIMIT
        0, // SKIP
      )
      .subscribe(
        (result) => {
          this.loading = false;
          if (result && result[0] && result[0].taxes) {
            this.taxes = result[0].taxes;
          } else {
            this.dataTaxes = new Array();
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        },
      );
  }

  public getBranches(): void {
    let match = `{"operationType": { "$ne": "D" }}`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      name: 1,
      operationType: 1,
    };

    // AGRUPAMOS EL RESULTADO
    let group = {
      _id: null,
      count: {$sum: 1},
      branches: {$push: '$$ROOT'},
    };

    this._branchesService
      .getBranches(
        project, // PROJECT
        match, // MATCH
        {}, // SORT
        group, // GROUP
        0, // LIMIT
        0, // SKIP
      )
      .subscribe(
        (result) => {
          this.loading = false;
          if (result && result[0] && result[0].branches) {
            this.branches = result[0].branches;
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        },
      );
  }

  public buildForm(): void {
    this.exportIVAForm = this._fb.group({
      month: [moment().subtract(1, 'month').format('MM'), [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])$')]],
      year: [moment().format('YYYY'), [Validators.required, Validators.pattern('^(20[2-9][0-9])$')]],
      folioNumber: [, []],
      otherFields: [false, [Validators.required]],
    });
  }

  public exportPDF(): void {
    let modalRef = this._modalService.open(PrintVatBookComponent);

    modalRef.componentInstance.params =
      this.type.replace('s', '') +
      '&' +
      this.exportIVAForm.value.year +
      this.exportIVAForm.value.month +
      '&' +
      this.exportIVAForm.value.folioNumber;
  }

  public exportAsXLSX(): void {

    const taxTotals = {};

    this.loading = true;
    this._transactionService
      .getVATBook(
        this.type.replace('s', '') +
          '&' +
          this.exportIVAForm.value.year +
          this.exportIVAForm.value.month +
          '&' +
          this.exportIVAForm.value.folioNumber,
      )
      .subscribe(
        async (result) => {
          if (result && result.transactions) {
            let sheet = new Array();

            for (let index = 0; index < this.branches.length; index++) {
              let data: any = [];
              let totalTaxBase = 0;
              let totalExempt = 0;
              let totalTaxAmountIVA = 0;
              let totalTaxAmountPercep = 0;
              let totalImpInt = 0;
              let totalAmount = 0;
              let totalIVA10: number = 0;
              let totalIVA21: number = 0;
              let totalIVA27: number = 0;
              let totalTaxes: Taxes[] = new Array();
              let i = 0;

              this.dataIVA.forEach((element) => {
                element['gravado'] = 0;
                element['iva10'] = 0;
                element['iva21'] = 0;
                element['iva27'] = 0;
              });

              this.dataState.forEach((element) => {
                element['gravado'] = 0;
                element['iva10'] = 0;
                element['iva21'] = 0;
                element['iva27'] = 0;
              });

              for (let transaction of result.transactions) {
                if (
                  transaction.branchDestination &&
                  this.branches[index] &&
                  transaction.branchDestination.name === this.branches[index].name
                ) {
                  data[i] = {};
                  //DATOS PRINCIPALES
                  data[i]['FECHA'] = this.dateFormat.transform(
                    transaction.endDate,
                    'DD/MM/YYYY',
                  );
                  if (transaction.company) {
                    data[i]['RAZÓN SOCIAL'] = transaction.company.name.toUpperCase();
                    data[i]['IDENTIFICADOR'] = transaction.company.identificationValue
                      ? transaction.company.identificationValue.replace(/-/g, '')
                      : '';
                  } else {
                    data[i]['RAZÓN SOCIAL'] = 'CONSUMIDOR FINAL';
                    data[i]['IDENTIFICADOR'] = '00000000000';
                  }
                  if (transaction.type.labelPrint && transaction.type.labelPrint !== '') {
                    data[i]['TIPO COMP.'] = transaction.type.labelPrint;
                  } else {
                    data[i]['TIPO COMP.'] = transaction.type.name;
                  }

                  data[i]['Abrev'] = transaction.type.abbreviation;

                  data[i]['Punto de Venta'] = this.padString(transaction.origin, 4);
                  data[i]['Letra'] = transaction.letter;
                  data[i]['Numero'] = this.padString(transaction.number, 8);
                  data[i]['CAE'] = transaction.CAE;

                  if (
                    (transaction.type.transactionMovement === TransactionMovement.Sale &&
                      transaction.type.movement === Movements.Outflows) ||
                    (transaction.type.transactionMovement ===
                      TransactionMovement.Purchase &&
                      transaction.type.movement === Movements.Inflows)
                  ) {
                    transaction.exempt *= -1;
                    transaction.totalPrice *= -1;
                  }

                  totalExempt += transaction.exempt;
                  totalAmount += transaction.totalPrice;

                  let partialTaxBase: number = 0;
                  let partialTaxAmountIVA: number = 0;
                  let partialTaxAmountPercep: number = 0;
                  let partialImpInt: number = 0;
                  let partialIVA10: number = 0;
                  let partialIVA21: number = 0;
                  let partialIVA27: number = 0;

                  if (transaction.taxes && transaction.taxes.length > 0) {
                    for (let transactionTax of transaction.taxes) {
                      // DATOS NUMÉRICOS
                      if (
                        (transaction.type.transactionMovement ===
                          TransactionMovement.Sale &&
                          transaction.type.movement === Movements.Outflows) ||
                        (transaction.type.transactionMovement ===
                          TransactionMovement.Purchase &&
                          transaction.type.movement === Movements.Inflows)
                      ) {
                        transactionTax.taxAmount *= -1;
                        transactionTax.taxBase *= -1;
                      }

                      let exists: boolean = false;

                      for (let transactionTaxAux of totalTaxes) {
                        if (
                          transactionTax.tax &&
                          transactionTaxAux.tax &&
                          transactionTaxAux.tax._id.toString() ===
                            transactionTax.tax._id.toString()
                        ) {
                          transactionTaxAux.taxAmount += transactionTax.taxAmount;
                          transactionTaxAux.taxBase += transactionTax.taxBase;
                          exists = true;
                        }
                      }
                      if (!exists) {
                        totalTaxes.push(transactionTax);
                      }

                      if (transactionTax.tax.classification === TaxClassification.Tax) {
                        totalTaxBase += transactionTax.taxBase;
                        partialTaxBase += transactionTax.taxBase;

                        if (transactionTax.tax.code === '04') {
                          totalImpInt += transactionTax.taxAmount;
                          partialImpInt += transactionTax.taxAmount;
                        }
                        if (
                          transactionTax.tax.code === '3' ||
                          transactionTax.tax.code === '4' ||
                          transactionTax.tax.code === '5' ||
                          transactionTax.tax.code === '6'
                        ) {
                          partialTaxAmountIVA += transactionTax.taxAmount;
                          totalTaxAmountIVA += transactionTax.taxAmount;
                        }

                        if (transactionTax.tax.code === '4') {
                          partialIVA10 += transactionTax.taxAmount;
                          totalIVA10 += transactionTax.taxAmount;
                        }
                        if (transactionTax.tax.code === '5') {
                          partialIVA21 += transactionTax.taxAmount;
                          totalIVA21 += transactionTax.taxAmount;
                        }
                        if (transactionTax.tax.code === '6') {
                          partialIVA27 += transactionTax.taxAmount;
                          totalIVA27 += transactionTax.taxAmount;
                        }
                      } else {
                        partialTaxAmountPercep += transactionTax.taxAmount;
                        totalTaxAmountPercep += transactionTax.taxAmount;
                      }

                      for (let index = 0; index < this.dataIVA.length; index++) {
                        if (
                          transaction.company &&
                          transaction.company.vatCondition &&
                          this.dataIVA[index]['_id'] === transaction.company.vatCondition
                        ) {
                          this.dataIVA[index]['gravado'] =
                            this.dataIVA[index]['gravado'] + transactionTax.taxBase;
                          this.dataIVA[index]['iva10'] += partialIVA10;
                          this.dataIVA[index]['iva21'] += partialIVA21;
                          this.dataIVA[index]['iva27'] += partialIVA27;
                        }
                      }

                      for (let index = 0; index < this.dataState.length; index++) {
                        if (
                          transaction.company &&
                          transaction.company.state &&
                          this.dataState[index]['_id'] === transaction.company.state
                        ) {
                          this.dataState[index]['gravado'] =
                            this.dataState[index]['gravado'] + transactionTax.taxBase;
                          this.dataState[index]['iva10'] += partialIVA10;
                          this.dataState[index]['iva21'] += partialIVA21;
                          this.dataState[index]['iva27'] += partialIVA27;
                        }
                      }
                    }

                    
                  }

                  data[i]['GRAVADO'] = this.roundNumber.transform(partialTaxBase);
                  data[i]['EXENTO'] = this.roundNumber.transform(transaction.exempt);

                  for (let tax of this.taxes) {
                    const matchingTax = transaction.taxes.find((taxTransaction: Taxes) => taxTransaction.tax._id === tax._id);
                    data[i][tax.name] = matchingTax ? matchingTax.taxAmount : 0;

                    if (matchingTax) {
                        if(!taxTotals[tax._id]) {
                          taxTotals[tax._id] = {
                            total: 0,
                            name: ''
                          };
                        }
                        taxTotals[tax._id].total = taxTotals[tax._id].total + matchingTax.taxAmount;
                        taxTotals[tax._id].name = tax.name;
                    }

                  }

                  data[i]['MONTO TOTAL'] = this.roundNumber.transform(
                      transaction.totalPrice
                  );

                  i++;
                  data[i] = {};
                }
              }

              i++;
              data[i] = {};
              data[i]['FECHA'] = 'TOTALES';
              data[i]['GRAVADO'] = this.roundNumber.transform(totalTaxBase);
              data[i]['EXENTO'] = this.roundNumber.transform(totalExempt);
              for (let tax of this.taxes) {
                data[i][tax.name] = taxTotals[tax._id]?.total ?? 0;
              }
              data[i]['MONTO TOTAL'] = this.roundNumber.transform(totalAmount);

              i += 5;
              data[i] = {};
              //data[i]['RAZÓN SOCIAL'] = 'TOTALES POR IMPUESTO';
              i++;
              data[i] = {};
              data[i]['RAZÓN SOCIAL'] = 'IMPUESTO';
              data[i]['IDENTIFICADOR'] = 'GRAVADO';
              data[i]['TIPO COMP.'] = 'MONTO';
              for (let tax of totalTaxes) {
                i++;
                data[i] = {};
                data[i]['RAZÓN SOCIAL'] = tax.tax.name;
                data[i]['IDENTIFICADOR'] = this.roundNumber.transform(tax.taxBase);
                data[i]['TIPO COMP.'] = this.roundNumber.transform(tax.taxAmount);
              }

              i += 5;
              data[i] = {};
              //data[i]["RAZÓN SOCIAL"] = 'TOTALES POR REGIMEN';
              i++;
              data[i] = {};
              data[i]['RAZÓN SOCIAL'] = 'REGIMEN';
              data[i]['IDENTIFICADOR'] = 'GRAVADO';
              data[i]['TIPO COMP.'] = 'IVA 10.5%';
              data[i]['Abrev'] = 'IVA 21%';
              data[i]['Punto de Venta'] = 'IVA 27%';
              this.dataIVA.forEach((element) => {
                i++;
                data[i] = {};
                data[i]['RAZÓN SOCIAL'] = element['description'];
                data[i]['IDENTIFICADOR'] = element['gravado'];
                data[i]['TIPO COMP.'] = element['iva10'];
                data[i]['Abrev'] = element['iva21'];
                data[i]['Punto de Venta'] = element['iva27'];
              });

              i += 5;
              data[i] = {};
              //data[i]["RAZÓN SOCIAL"] = 'PROVINCIAS';
              i++;
              data[i] = {};
              data[i]['RAZÓN SOCIAL'] = 'PROVINCIAS';
              data[i]['IDENTIFICADOR'] = 'GRAVADO';
              data[i]['TIPO COMP.'] = 'IVA 10.5%';
              data[i]['Abrev'] = 'IVA 21%';
              data[i]['Punto de Venta'] = 'IVA 27%';
              this.dataState.forEach((element) => {
                i++;
                data[i] = {};
                data[i]['RAZÓN SOCIAL'] = element['name'];
                data[i]['IDENTIFICADOR'] = element['gravado'];
                data[i]['TIPO COMP.'] = element['iva10'];
                data[i]['Abrev'] = element['iva21'];
                data[i]['Punto de Venta'] = element['iva27'];
              });

              i += 5;

              sheet[index] = data;
            }
            sheet[0].sort(function (a, b) {
              if (a.FECHA == b.FECHA) {
                if (a.Numero > b.Numero) {
                  return 1;
                }
                if (a.Numero < b.Numero) {
                  return -1;
                }
              }

              return 0;
            });
            if (sheet.length === 1) {
              this._companyService.exportAsExcelFile(
                sheet[0],
                this.type +
                  '-' +
                  this.exportIVAForm.value.year +
                  '-' +
                  this.exportIVAForm.value.month,
              );
            } else {
              this._companyService.exportAsExcelFileMulti(
                sheet[0],
                sheet[1],
                this.type +
                  '-' +
                  this.exportIVAForm.value.year +
                  '-' +
                  this.exportIVAForm.value.month,
              );
            }
            this.loading = false;
          } else {
            this.showMessage(
              'No se encontraron comprobantes para el período indicado',
              'info',
              true,
            );
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        },
      );
  }

  public padString(n, length) {
    n = n.toString();
    while (n.length < length) n = '0' + n;

    return n;
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
    this.loading = false;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
