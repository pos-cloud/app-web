import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { VariantType } from '../variant-type';

import { VariantTypeService } from '../variant-type.service';

@Component({
  selector: 'app-update-variant-type',
  templateUrl: './update-variant-type.component.html',
  styleUrls: ['./update-variant-type.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateVariantTypeComponent implements OnInit {

  @Input() variantType: VariantType;
  @Input() readonly: boolean;
  public variantTypeForm: UntypedFormGroup;
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
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.variantTypeForm.setValue({
      '_id': this.variantType._id,
      'order': this.variantType.order,
      'name': this.variantType.name,
      'meliId': this.variantType.meliId
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.variantTypeForm = this._fb.group({
      '_id': [this.variantType._id, []],
      'order': [this.variantType.order, [Validators.required]],
      'name': [this.variantType.name, [Validators.required]],
      'meliId': [this.variantType.meliId, []],
    });

    this.variantTypeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
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

  public updateVariantType(): void {
    if (!this.readonly) {
      this.loading = true;
      this.variantType = this.variantTypeForm.value;
      this.saveChanges();
    }
  }

  public saveChanges(): void {

    this.loading = true;

    this._variantTypeService.updateVariantType(this.variantType).subscribe(
      result => {
        if (!result.variantType) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.variantType = result.variantType;
          this.showMessage("El tipo de variante se ha actualizado con éxito.", 'success', false);
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