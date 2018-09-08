import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { TransactionService } from './../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { ConfigService } from '../../services/config.service';

import { Config } from './../../app.config';

@Component({
  selector: 'app-export-citi',
  templateUrl: './export-citi.component.html',
  styleUrls: ['./export-citi.component.css']
})
export class ExportCitiComponent implements OnInit {

  public exportCitiForm: FormGroup;
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
    'year' : ''
  };

  public validationMessages = {
    'month' : {
      'required':     'Este campo es requerido.'
    },
    'year' : {
      'required':     'Este campo es requerido.'
    }
  };

  constructor(
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
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
    this.exportCitiForm = this._fb.group({
      'month': [moment().subtract(1, "month").format("MM"), [
        Validators.required
        ]
      ],
      'year': [moment().format("YYYY"), [
        Validators.required
        ]
      ],
    });
    this.exportCitiForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {
    
    if (!this.exportCitiForm) { return; }
    const form = this.exportCitiForm;

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

  public exportCiti(): void {
    
    this.loading = true;

    this.VATPeriod = this.exportCitiForm.value.year + this.exportCitiForm.value.month;

    this._transactionService.exportCiti(this.VATPeriod).subscribe(
      result => {
        if (result.message !== "OK") {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true); 
        } else {
          this.showMessage("Los archivos se generaron correctamente.", "success", false);
          this.compURL = '-' + this._userService.getDatabase()+ '-CITI-ventas-' + 'comp' + this.VATPeriod + ".txt";
          this.aliURL = '-' + this._userService.getDatabase()+ '-CITI-ventas-' + 'ali' + this.VATPeriod + ".txt";
          this.toggleButton = true;
        }
        this.loading = false;
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

  public hideMessage(): void {
    this.alertMessage = "";
  }
}