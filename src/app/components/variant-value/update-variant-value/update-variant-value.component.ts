import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { VariantValue } from '../variant-value';

import { VariantValueService } from '../variant-value.service';
import { VariantType } from 'app/components/variant-type/variant-type';
import { VariantTypeService } from 'app/components/variant-type/variant-type.service';

@Component({
  selector: 'app-update-variant-value',
  templateUrl: './update-variant-value.component.html',
  styleUrls: ['./update-variant-value.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateVariantValueComponent implements OnInit {

  @Input() variantValue: VariantValue;
  @Input() readonly: boolean;
  public variantTypes: VariantType[];
  public variantValueForm: FormGroup;
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'type': '',
    'order': '',
    'description': ''
  };

  public validationMessages = {
    'type': {
      'required': 'Este campo es requerido.'
    },
    'order': {
      'required': 'Este campo es requerido.'
    },
    'description': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _variantValueService: VariantValueService,
    public _variantTypeService: VariantTypeService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    this.getVariantTypes();
    this.buildForm();
    this.variantValueForm.setValue({
      '_id': this.variantValue._id,
      'order': this.variantValue.order,
      'description': this.variantValue.description,
      'type': this.variantValue.type._id
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.variantValueForm = this._fb.group({
      '_id': [this.variantValue._id, [
        ]
      ],
      'type': [this.variantValue.type, [
        Validators.required
        ]
      ],
      'order': [this.variantValue.order, [
        Validators.required
        ]
      ],
      'description': [this.variantValue.description, [
        Validators.required
        ]
      ],
    });

    this.variantValueForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.variantValueForm) { return; }
    const form = this.variantValueForm;

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

  public getVariantTypes(): void {

    this.loading = true;

    this._variantTypeService.getVariantTypes().subscribe(
      result => {
        if (!result.variantTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
          this.loading = false;
          this.variantTypes = null;
        } else {
          this.hideMessage();
          this.loading = false;
          this.variantTypes = result.variantTypes;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateVariantValue(): void {
    if (!this.readonly) {
      this.loading = true;
      this.variantValue = this.variantValueForm.value;
      this.saveChanges();
    }
  }

  public saveChanges(): void {

    this.loading = true;

    this._variantValueService.updateVariantValue(this.variantValue).subscribe(
      result => {
        if (!result.variantValue) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.variantValue = result.variantValue;
          this.showMessage("El valor de variante se ha actualizado con éxito.", 'success', false);
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