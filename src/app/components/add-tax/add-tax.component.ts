import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Tax, TaxBase, TaxClassification, TaxType } from './../../models/tax';

import { TaxService } from './../../services/tax.service';

@Component({
  selector: 'app-add-tax',
  templateUrl: './add-tax.component.html',
  styleUrls: ['./add-tax.component.css'],
  providers: [NgbAlertConfig]
})

export class AddTaxComponent implements OnInit {

  public tax: Tax;
  @Input() taxId: string;
  @Input() operation: string;
  @Input() readonly: boolean;
  public taxBases: TaxBase[] = [ TaxBase.None, TaxBase.Neto ];
  public taxClassifications: TaxClassification[] = [ TaxClassification.None, TaxClassification.Tax, TaxClassification.Withholding, TaxClassification.Perception ];
  public taxTypes: TaxType[] = [ TaxType.None, TaxType.National, TaxType.State, TaxType.City ];
  public taxForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'code': '',
    'name': '',
    'taxBase': '',
    'percentage': '',
    'amount': '',
    'classification': '',
    'type': '',
    'lastNumber': '',
  };

  public validationMessages = {
    'code': {
      'required': 'Este campo es requerido.'
    },
    'name': {
      'required': 'Este campo es requerido.'
    },
    'taxBase': {
    },
    'percentage': {
    },
    'amount': {
    },
    'classification': {
      'required': 'Este campo es requerido.'
    },
    'type': {
    },
    'lastNumber': {
    },
  };

  constructor(
    public _taxService: TaxService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    this.tax = new Tax();
  }

  async ngOnInit() {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    if(this.taxId) {
      await this.getTax(this.taxId).then;
    } else {
      await this.getTaxes('sort="code":-1&limit=1').then(
        taxes => {
          if(taxes) {
            try {
              this.tax.code = (parseInt(taxes[0].code) + 1).toString();
              this.setValuesForm();
            } catch (e) {
            }
          }
        }
      );
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.taxForm = this._fb.group({
      '_id': [this.tax._id, [
          Validators.required
        ]
      ],
      'code': [this.tax.code, [
          Validators.required
        ]
      ],
      'name': [this.tax.name, [
          Validators.required
        ]
      ],
      'taxBase': [this.tax.taxBase, [
        ]
      ],
      'percentage': [this.tax.percentage, [
        ]
      ],
      'amount': [this.tax.amount, [
        ]
      ],
      'classification': [this.tax.classification, [
          Validators.required
        ]
      ],
      'type': [this.tax.type, [
        ]
      ],
      'lastNumber': [this.tax.lastNumber, [
        ]
      ],
    });

    this.taxForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.taxForm) { return; }
    const form = this.taxForm;

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

  public getTax(taxId: string): Promise<Tax> {

    return new Promise((resolve, reject) => {

      this._taxService.getTax(taxId).subscribe(
        result => {
          if (!result.tax) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.tax);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getTaxes(query?: string): Promise<Tax> {

    return new Promise((resolve, reject) => {

      this._taxService.getTaxes(query).subscribe(
        result => {
          if (!result.taxes) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.taxes);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public setValuesForm() {

    if(!this.tax._id) this.tax._id = "";
    if(!this.tax.code) this.tax.code = "0";
    if(!this.tax.name) this.tax.name = "";
    if(!this.tax.taxBase) this.tax.taxBase = TaxBase.None;
    if(!this.tax.percentage) this.tax.percentage = 0;
    if(!this.tax.amount) this.tax.amount = 0;
    if(!this.tax.type) this.tax.type = TaxType.None;
    if(!this.tax.classification) this.tax.classification = TaxClassification.None;
    if(!this.tax.lastNumber) this.tax.lastNumber = 0;
    
    let values = {
      '_id': this.tax._id,
      'code': this.tax.code,
      'name': this.tax.name,
      'taxBase': this.tax.taxBase,
      'percentage': this.tax.percentage,
      'amount': this.tax.amount,
      'type': this.tax.type,
      'classification': this.tax.classification,
      'lastNumber': this.tax.lastNumber
    };

    this.taxForm.setValue(values);
  }

  public addTax(): void {

    if (!this.readonly) {
      this.tax = this.taxForm.value;
      if (this.operation === 'add') {
        this.saveTax();
      } else if (this.operation === 'update') {
        this.updateTax();
      }
    }
  }

  public saveTax(): void {

    this.loading = true;

    this._taxService.saveTax(this.tax).subscribe(
      result => {
        if (!result.tax) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.tax = result.tax;
          this.showMessage("El impuesto se ha añadido con éxito.", 'success', true);
          let code = this.tax.code;
          this.tax = new Tax();
          this.buildForm();
          try {
            this.tax.code = (parseInt(code) + 1).toString();
            this.setValuesForm();
          } catch (e) {
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateTax(): void {

    this.loading = true;

    this._taxService.updateTax(this.tax).subscribe(
      result => {
        if (!result.tax) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.tax = result.tax;
          this.showMessage("El impuesto se ha actualizado con éxito.", 'success', false);
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
    this.alertMessage = '';
  }
}