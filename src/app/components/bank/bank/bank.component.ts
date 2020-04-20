import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';


import { BankService } from '../bank.service';

import { Bank } from '../bank';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.css'],
  providers: [NgbAlertConfig]
})
export class BankComponent implements OnInit {

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() bankId : string;
  public alertMessage: string = '';
  public userType: string;
  public bank: Bank;
  public areBankEmpty: boolean = true;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public userCountry: string;
  public bankForm: FormGroup;
  public orientation: string = 'horizontal';

  public formErrors = {
    'code': '',
    'name': '',
    'agency' : ''
  };

  public validationMessages = {
    'code': {
      'required': 'Este campo es requerido.'
    },
    'agency': {
      'required': 'Este campo es requerido.'
    },
    'name': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public alertConfig: NgbAlertConfig,
    public _bankService: BankService,
    public _router: Router,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
  ) {
    if(window.screen.width < 1000) this.orientation = 'vertical';
    this.bank = new Bank();
  }

  ngOnInit() {
    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];;
    this.buildForm();
    
    if (this.bankId) {
      this.getBank();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getBank() {

    this.loading = true;

    this._bankService.getBank(this.bankId).subscribe(
      result => {
        if (!result.bank) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.bank = result.bank;
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {

   
    if (!this.bank._id) { this.bank._id = ''; }
    if (!this.bank.code) { this.bank.code = 0; }
    if (!this.bank.name) { this.bank.name = ''; }
    if (!this.bank.agency) { this.bank.agency = 0; }
    if (!this.bank.account) { this.bank.account = ''; }


    const values = {
      '_id': this.bank._id,
      'code': this.bank.code,
      'name': this.bank.name,
      'agency' : this.bank.agency,
      'account' : this.bank.account,
    };
    this.bankForm.setValue(values);
  }

  public buildForm(): void {

    this.bankForm = this._fb.group({
      '_id' : [this.bank._id, []],
      'code': [this.bank.code, [
        Validators.required
        ]
      ],
      'name': [this.bank.name, [
        Validators.required
        ]
      ],
      'agency': [this.bank.agency, [
        Validators.required
        ]
      ],
      'account' : [this.bank.account,[]]
    });

    this.bankForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.bankForm) { return; }
    const form = this.bankForm;

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

  public addBank() {

    switch (this.operation) {
      case 'add':
        this.saveBank();
        break;
      case 'edit':
        this.updateBank();
        break;
      case 'delete' :
        this.deleteBank();
      default:
        break;
    }
  }

  public updateBank() {

    this.loading = true;

    this.bank = this.bankForm.value;

    this._bankService.updateBank(this.bank).subscribe(
      result => {
        if (!result.bank) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.loading = false;
          this.showMessage('El banco se ha actualizado con éxito.', 'success', false);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveBank() {

    this.loading = true;

    this.bank = this.bankForm.value;

    this._bankService.saveBank(this.bank).subscribe(
      result => {
        if (!result.bank) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.loading = false;
            this.showMessage('El banco se ha añadido con éxito.', 'success', false);
            this.bank = new Bank();
            this.buildForm();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteBank() {

    this.loading = true;

    this._bankService.deleteBank(this.bank._id).subscribe(
      result => {
        this.loading = false;
        if (!result.bank) {
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.activeModal.close();
        }
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
    this.alertMessage = '';
  }
}


