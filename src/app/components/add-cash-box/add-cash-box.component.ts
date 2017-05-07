import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CashBox } from './../../models/cash-box';

import { CashBoxService } from './../../services/cash-box.service';

@Component({
  selector: 'app-add-cash-box',
  templateUrl: './add-cash-box.component.html',
  styleUrls: ['./add-cash-box.component.css'],
  providers: [NgbAlertConfig]
})

export class AddCashBoxComponent  implements OnInit {

  private cashBox: CashBox;
  private cashBoxForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  private formErrors = {
    'openingCash': ''
  };

  private validationMessages = {
    'openingCash': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    private _cashBoxService: CashBoxService,
    private _fb: FormBuilder,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let locationPathURL: string;
    this._router.events.subscribe((data:any) => { 
      locationPathURL = data.url.split('/');
      this.userType = locationPathURL[1];
    });
    this.cashBox = new CashBox();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

    this.cashBoxForm = this._fb.group({
      'code': [this.cashBox.code, [
        ]
      ],
      'openingDate': [this.cashBox.openingDate, [
        ]
      ],
      'closingDate': [this.cashBox.closingDate, [
        ]
      ],
      'openingCash': [this.cashBox.openingCash, [
          Validators.required
        ]
      ],
      'closingCash': [this.cashBox.closingCash, [
        ]
      ],
      'invoicedCash': [this.cashBox.invoicedCash, [
        ]
      ],
      'difference': [this.cashBox.difference, [
        ]
      ],
      'status': [this.cashBox.status, [
        ]
      ],
    });

    this.cashBoxForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  private onValueChanged(data?: any): void {

    if (!this.cashBoxForm) { return; }
    const form = this.cashBoxForm;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
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

  private addCashBox(): void {
    
    this.loading = true;
    this.cashBox = this.cashBoxForm.value;
    this.getLastCashBox();
  }

  private getLastCashBox(): void {

    this._cashBoxService.getLastCashBox().subscribe(
      result => {
        if (!result.cashBox[0]) {
          this.cashBox.code = 1;
          this.saveCashBox();
        } else {
          this.cashBox.code = (result.cashBox[0].code + 1);
          this.saveCashBox();
        }
			},
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }

  private saveCashBox(): void {
    
    this._cashBoxService.saveCashBox(this.cashBox).subscribe(
    result => {
        if (!this.cashBox) {
          this.alertMessage = 'Ha ocurrido un error al querer crear la caja.';
        } else {
          this.cashBox = result.cashBox;
          this.alertConfig.type = 'success';
          this.alertMessage = "La caja se ha añadido con éxito.";      
          this.activeModal.close();
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }
}