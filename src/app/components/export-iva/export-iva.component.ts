import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { TransactionService } from './../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { ConfigService } from '../../services/config.service';
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
    public _userService: UserService
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

  public exportIVA(): void {
    
    
    let modalRef = this._modalService.open(PrintComponent);
    modalRef.componentInstance.typePrint = "IVA";
    modalRef.componentInstance.params = this.type.replace('s','')+"&"+this.exportIVAForm.value.year+this.exportIVAForm.value.month+"&"+this.exportIVAForm.value.folioNumber;
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
