import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { VariantType } from '../variant-type';

import { VariantTypeService } from '../variant-type.service';

@Component({
  selector: 'app-add-variant-type',
  templateUrl: './add-variant-type.component.html',
  styleUrls: ['./add-variant-type.component.css'],
  providers: [NgbAlertConfig]
})

export class AddVariantTypeComponent implements OnInit {

  public variantType: VariantType;
  public variantTypeForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'order': '',
    'name': '',
    'meliId': ''
  };

  public validationMessages = {
    'order': {
      'required': 'Este campo es requerido.'
    },
    'name': {
      'required': 'Este campo es requerido.'
    },
    'meliId': {
    }
  };

  constructor(
    public _variantTypeService: VariantTypeService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.variantType = new VariantType();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.variantTypeForm = this._fb.group({
      'order': [this.variantType.order, [
          Validators.required
        ]
      ],
      'name': [this.variantType.name, [
          Validators.required
        ]
      ],
      'meliId': [this.variantType.meliId, []
      ],
    });

    this.variantTypeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.variantTypeForm) { return; }
    const form = this.variantTypeForm;

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

  public addVariantType(): void {

    this.variantType = this.variantTypeForm.value;
    this.saveVariantType();
  }

  public saveVariantType(): void {

    this.loading = true;

    this._variantTypeService.saveVariantType(this.variantType).subscribe(
      result => {
        if (!result.variantType) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.variantType = result.variantType;
          this.showMessage("El tipo de variante se ha añadido con éxito.", 'success', true);
          this.variantType = new VariantType();
          this.buildForm();
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