import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

import { Variant } from './../../models/variant';
import { VariantType } from './../../models/variant-type';
import { VariantValue } from './../../models/variant-value';
import { Article } from './../../models/article';

import { VariantService } from './../../services/variant.service';
import { VariantValueService } from './../../services/variant-value.service';
import { VariantTypeService } from './../../services/variant-type.service';

@Component({
  selector: 'app-add-variant',
  templateUrl: './add-variant.component.html',
  styleUrls: ['./add-variant.component.css'],
  providers: [NgbAlertConfig]
})

export class AddVariantComponent implements OnInit {

  @Input() variant: Variant;
  @Input() article: Article;
  public variantTypes: VariantType[];
  public variantTypeSelected: VariantType;
  public variantValues: VariantValue[];
  public variantForm: FormGroup;
  public alertMessage: string = "";
  public user: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  @Output() eventAddVariant: EventEmitter<Variant> = new EventEmitter<Variant>();

  public formErrors = {
    'type': '',
    'value': ''
  };

  public validationMessages = {
    'type': {
      'required': 'Este campo es requerido.'
    },
    'value': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _variantService: VariantService,
    public _variantTypeService: VariantTypeService,
    public _variantValueService: VariantValueService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.user = pathLocation[1];
    this.getVariantTypes();
    if(!this.variant) {
      this.variant = new Variant();
      this.variant.articleParent = this.article;
    }
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.variantForm = this._fb.group({
      'type': [this.variant.type, [
          Validators.required
        ]
      ],
      'value': [this.variant.value, [
          Validators.required
        ]
      ],
    });

    this.variantForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.variantForm) { return; }
    const form = this.variantForm;

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

    this.variantTypeSelected = this.variantForm.value.type;
  }

  public getVariantTypes(): void {

    this.loading = true;

    this._variantTypeService.getVariantTypes().subscribe(
      result => {
        if (!result.variantTypes) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
          this.variantTypes = null;
        } else {
          this.hideMessage();
          this.loading = false;
          this.variantTypes = result.variantTypes;
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {

    if(!this.variant.type) this.variant.type = null;
    if(!this.variant.value) this.variant.value = null;
    
    this.variantForm.setValue({
      'type': this.variant.type,
      'value': this.variant.value
    });
  }

  public refreshValues(): void {

    if(this.variantTypeSelected) {
      this.variant.value = null;
      this.getVariantValuesByType(this.variantTypeSelected);
    } else {
      this.variant.type = null;
      this.variant.value = null;
      this.setValueForm();
    }
  }

  public getVariantValuesByType(variantType: VariantType): void {

    this.loading = true;

    this._variantValueService.getVariantValuesByType(variantType).subscribe(
      result => {
        if (!result.variantValues) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
          this.variantValues = null;
        } else {
          this.hideMessage();
          this.loading = false;
          this.variantValues = result.variantValues;
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public addVariant(): void {
    this.variant = this.variantForm.value;
    this.eventAddVariant.emit(this.variant);
    this.variant = new Variant();
    this.setValueForm();
    this.buildForm();
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