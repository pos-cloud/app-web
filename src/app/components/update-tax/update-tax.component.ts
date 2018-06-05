import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Tax } from './../../models/tax';

import { TaxService } from './../../services/tax.service';

@Component({
  selector: 'app-update-tax',
  templateUrl: './update-tax.component.html',
  styleUrls: ['./update-tax.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateTaxComponent implements OnInit {

  @Input() tax: Tax;
  @Input() readonly: boolean;
  public taxForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': ''
  };

  public validationMessages = {
    'name': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _taxService: TaxService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.taxForm.setValue({
      '_id': this.tax._id,
      'name': this.tax.name
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.taxForm = this._fb.group({
      '_id': [this.tax._id, [
      ]
      ],
      'name': [this.tax.name, [
        Validators.required
      ]
      ],
    });

    this.taxForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
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

  public updateTax(): void {
    if (!this.readonly) {
      this.loading = true;
      this.tax = this.taxForm.value;
      this.saveChanges();
    }
  }

  public saveChanges(): void {

    this.loading = true;

    this._taxService.updateTax(this.tax).subscribe(
      result => {
        if (!result.tax) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.tax = result.tax;
          this.showMessage("El impuesto se ha actualizado con éxito.", "success", false);
          this.activeModal.close('save_close');
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