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

  public cashBox: CashBox;
  public cashBoxForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'openingCash': ''
  };

  public validationMessages = {
    'openingCash': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _cashBoxService: CashBoxService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.cashBox = new CashBox();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

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
      'state': [this.cashBox.state, [
        ]
      ],
    });

    this.cashBoxForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.cashBoxForm) { return; }
    const form = this.cashBoxForm;

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

  public addCashBox(): void {
    
    this.loading = true;
    this.cashBox = this.cashBoxForm.value;
    this.getLastCashBox();
  }

  public getLastCashBox(): void {

    this.loading = true;
    
    this._cashBoxService.getLastCashBox().subscribe(
      result => {
        if (!result.cashBoxes) {
          this.cashBox.code = 1;
          this.saveCashBox();
        } else {
          this.cashBox.code = (result.cashBoxes[0].code + 1);
          this.saveCashBox();
        }
			},
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public saveCashBox(): void {
    
    this.loading = true;
    
    this._cashBoxService.saveCashBox(this.cashBox).subscribe(
      result => {
        if (!result.cashBox) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.cashBox = result.cashBox;
          this.showMessage("La caja se ha añadido con éxito.", "success", false);
          this.activeModal.close();
        }
        this.loading = false;
      },
      error => {
        error => {
          this.showMessage(error._body, "danger", true);
          this.loading = false;
        }
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