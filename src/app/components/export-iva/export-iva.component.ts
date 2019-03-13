import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { TransactionService } from './../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { ConfigService } from '../../services/config.service';
import { CompanyService } from './../../services/company.service';


import { PrintComponent } from './../../components/print/print.component'
import { Config } from './../../app.config';

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
            this.hideMessage();
            
            console.log(result);

            let data: any = [] 

            for (let index = 0; index < result.length; index++) {
              data[index] = {};

              data[index]['Fecha'] = this.padString(result[index]['day'],2) + '/' + this.padString(result[index]['month'],2);
              data[index]['Razón Social'] = result[index]['nameCompany'];
              data[index]['Identificador'] = result[index]['identificationValue'];
              data[index]['Tipo de Comprobante'] = result[index]['labelPrint'];
              data[index]['Nro Comprobante'] = this.padString(result[index]['origin'],5)  + '-' + result[index]['letter'] + '-' + this.padString( result[index]['number'],8);
              data[index]['Gravado'] = result[index]['GRAVADO'];
              data[index]['Excento'] = result[index]['EXENT_NOGRAV'];
              data[index]['% IVA'] = result[index]['IVA_PORCENTAJE'];
              data[index]['IVA'] = result[index]['IVA'];
              data[index]['PERC. IVA'] = result[index]['IVA_PERCEP'];
              data[index]['PERC. IIBB'] = result[index]['IIBB_PERCEP'];
              data[index]['TOTAL'] = result [index]['TOTAL'];
              
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
