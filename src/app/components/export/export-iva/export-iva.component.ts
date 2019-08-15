import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { TransactionService } from '../../../services/transaction.service';
import { UserService } from '../../../services/user.service';
import { ConfigService } from '../../../services/config.service';
import { CompanyService } from '../../../services/company.service';


import { PrintComponent } from '../../print/print/print.component'
import { DateFormatPipe } from 'app/pipes/date-format.pipe';
import { Taxes } from 'app/models/taxes';
import { TaxClassification } from 'app/models/tax';
import { RoundNumberPipe } from 'app/pipes/round-number.pipe';
import { Movements, TransactionMovement } from 'app/models/transaction-type';

@Component({
  selector: 'app-export-iva',
  templateUrl: './export-iva.component.html',
  styleUrls: ['./export-iva.component.css']
})
export class ExportIvaComponent implements OnInit {

  @Input() type;
  public exportIVAForm: FormGroup;
  public alertMessage: string = "";
  public loading: boolean = false;
  public months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  public years = ["2018", "2019", "2020", "2021", "2022"];
  public toggleButton: boolean;
  public VATPeriod: string;
  public compURL: string;
  public aliURL: string;
  public dateFormat = new DateFormatPipe();
  public roundNumber = new RoundNumberPipe();

  public formErrors = {
    'month': '',
    'year' : '',
    'folioNumber' : ''
  };

  public validationMessages = {
    'month' : {
      'required':     'Este campo es requerido.'
    },
    'year' : {
      'required':     'Este campo es requerido.'
    },
    'folioNumber':{
      'required':     'Este campo es requerido'
    }
  };

  constructor(
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public _transactionService: TransactionService,
    public _configService: ConfigService,
    public _userService: UserService,
    public _companyService: CompanyService,
  ) { }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.buildForm();
  }

  public buildForm(): void {
    this.exportIVAForm = this._fb.group({
      'month': [moment().subtract(1, "month").format("MM"), [
        Validators.required
        ]
      ],
      'year': [moment().format("YYYY"), [
        Validators.required
        ]
      ],
      'folioNumber': [,[]]
    });
    this.exportIVAForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.exportIVAForm) { return; }
    const form = this.exportIVAForm;

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

  public exportPDF(): void {

    let modalRef = this._modalService.open(PrintComponent);
    modalRef.componentInstance.typePrint = "IVA";
    modalRef.componentInstance.params = this.type.replace('s','')+"&"+this.exportIVAForm.value.year+this.exportIVAForm.value.month+"&"+this.exportIVAForm.value.folioNumber;
  }

  public exportAsXLSX() : void {

    this._transactionService.getVATBook(this.type.replace('s','')+"&"+this.exportIVAForm.value.year+this.exportIVAForm.value.month+"&"+this.exportIVAForm.value.folioNumber).subscribe(
      result => {
        if (!result) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          } else {
            let data: any = [];
            let totalTaxBase = 0;
            let totalExempt = 0;
            let totalTaxAmountIVA = 0;
            let totalTaxAmountPercep = 0;
            let totalAmount = 0;
            let totalTaxes: Taxes[] = new Array();
            let i = 0;
            for (let transaction of result) {
              
              data[i] = {};

              //DATOS PRINCIPALES
              data[i]['FECHA'] = this.dateFormat.transform(transaction.endDate, 'DD/MM/YYYY');
              if(transaction.company) {
                data[i]['RAZÓN SOCIAL'] = transaction.company.name.toUpperCase();
                data[i]['IDENTIFICADOR'] = transaction.company.identificationValue.replace(/-/g, "");
              } else {
                data[i]['RAZÓN SOCIAL'] = 'CONSUMIDOR FINAL';
                data[i]['IDENTIFICADOR'] = '00000000000';
              }
              if(transaction.type.labelPrint && transaction.type.labelPrint !== "") {
                data[i]['TIPO COMP.'] = transaction.type.labelPrint;
              } else {
                data[i]['TIPO COMP.'] = transaction.type.name;
              }

              data[i]['NRO COMP.'] =  this.padString(transaction.origin, 4) + "-" +
                                                    transaction.letter + "-" +
                                      this.padString(transaction.number, 8);

              if(transaction.type.transactionMovement === TransactionMovement.Sale && transaction.type.movement === Movements.Outflows ||
                transaction.type.transactionMovement === TransactionMovement.Purchase && transaction.type.movement === Movements.Inflows) {
                transaction.exempt *= -1;
                transaction.totalPrice *= -1;
              }
      
              totalExempt += transaction.exempt;
              totalAmount += transaction.totalPrice;

              let partialTaxBase: number = 0;
              let partialTaxAmountIVA: number = 0;
              let partialTaxAmountPercep: number = 0;

              if(transaction.taxes && transaction.taxes.length > 0 && transaction.taxes[0].tax) {
                for(let transactionTax of transaction.taxes) {

                  // DATOS NUMÉRICOS
                  if(transaction.type.transactionMovement === TransactionMovement.Sale && transaction.type.movement === Movements.Outflows ||
                    transaction.type.transactionMovement === TransactionMovement.Purchase && transaction.type.movement === Movements.Inflows) {
                    transactionTax.taxAmount *= -1;
                    transactionTax.taxBase *= -1;
                  }
                  
                  let exists: boolean = false;
                  for (let transactionTaxAux of totalTaxes) {
                    if (transactionTaxAux.tax._id.toString() === transactionTax.tax._id.toString()) {
                      transactionTaxAux.taxAmount += transactionTax.taxAmount;
                      transactionTaxAux.taxBase += transactionTax.taxBase;
                      exists = true;
                    }
                  }
                  if (!exists) {
                    totalTaxes.push(transactionTax);
                  }

                  if(transactionTax.tax.classification === TaxClassification.Tax) {
                    totalTaxBase += transactionTax.taxBase;
                    partialTaxAmountIVA += transactionTax.taxAmount;
                    partialTaxBase += transactionTax.taxBase;
                    totalTaxAmountIVA += transactionTax.taxAmount;
                  } else {
                    partialTaxAmountPercep += transactionTax.taxAmount;
                    totalTaxAmountPercep += transactionTax.taxAmount;
                  }
                }
              }

              data[i]['GRAVADO'] = this.roundNumber.transform(partialTaxBase);
              data[i]['EXENTO'] = this.roundNumber.transform(transaction.exempt);
              data[i]['MONTO IVA'] = this.roundNumber.transform(partialTaxAmountIVA);
              data[i]['MONTO PERCEP.'] = this.roundNumber.transform(partialTaxAmountPercep);
              data[i]['MONTO TOTAL'] = this.roundNumber.transform(partialTaxBase + partialTaxAmountIVA + partialTaxAmountPercep + transaction.exempt);

              i++;
              data[i] = {};
            }

            i++;
            data[i] = {};
            data[i]['FECHA'] = "TOTALES";
            data[i]['GRAVADO'] = this.roundNumber.transform(totalTaxBase);
            data[i]['EXENTO'] = this.roundNumber.transform(totalExempt);
            data[i]['MONTO IVA'] = this.roundNumber.transform(totalTaxAmountIVA);
            data[i]['MONTO PERCEP.'] = this.roundNumber.transform(totalTaxAmountPercep);
            data[i]['MONTO TOTAL'] = this.roundNumber.transform(totalAmount);

            i += 5;
            data[i] = {};
            data[i]['RAZÓN SOCIAL'] = 'TOTALES POR IMPUESTO';
            i++;
            data[i] = {};
            data[i]['RAZÓN SOCIAL'] = 'IMPUESTO';
            data[i]['IDENTIFICADOR'] = 'GRAVADO';
            data[i]['TIPO COMP.'] = 'MONTO';
            for(let tax of totalTaxes) {
              i++;
              data[i] = {};
              data[i]['RAZÓN SOCIAL'] = tax.tax.name;
              data[i]['IDENTIFICADOR'] = this.roundNumber.transform(tax.taxBase);
              data[i]['TIPO COMP.'] = this.roundNumber.transform(tax.taxAmount);
            }

            this._companyService.exportAsExcelFile(data, this.type + '-'+ this.exportIVAForm.value.year+'-'+this.exportIVAForm.value.month);
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
    );
  }

  public padString(n, length) {
    var n = n.toString();
    while (n.length < length)
      n = "0" + n;
    return n;
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
