import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Variant } from '../variant';
import { VariantType } from '../../variant-type/variant-type';
import { VariantValue } from '../../variant-value/variant-value';
import { Article } from '../../article/article';

import { VariantService } from '../variant.service';
import { VariantValueService } from '../../variant-value/variant-value.service';
import { VariantTypeService } from '../../variant-type/variant-type.service';
import { OrderByPipe } from 'app/main/pipes/order-by.pipe';

@Component({
  selector: 'app-add-variant',
  templateUrl: './add-variant.component.html',
  styleUrls: ['./add-variant.component.css'],
  providers: [NgbAlertConfig]
})

export class AddVariantComponent implements OnInit {

  public variant: Variant;
  @Input() variants: Variant[];
  public variantsByTypes: any[];
  @Input() article: Article;
  @Output() eventAddVariants: EventEmitter<Variant[]> = new EventEmitter<Variant[]>();
  public variantTypes: VariantType[];
  public variantTypeSelected: VariantType;
  public variantValues: VariantValue[];
  public variantForm: UntypedFormGroup;
  public alertMessage: string = '';
  public user: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public areVariantsEmpty: boolean;
  public lastVariant: Variant;
  public orderByPipe: OrderByPipe = new OrderByPipe();


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
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {
    this.variantTypes = new Array();
    this.variantsByTypes = new Array();
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.user = pathLocation[1];
    if (!this.variant) {
      this.variant = new Variant();
      this.variant.articleParent = this.article;
    }
    this.getVariantTypes();
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

    let query = 'sort="name":1,"order":1';

    this._variantTypeService.getVariantTypes(query).subscribe(
      result => {
        if (!result.variantTypes) {
          this.loading = false;
          this.variantTypes = new Array();
        } else {
          this.hideMessage();
          this.loading = false;
          this.variantTypes = result.variantTypes;
          if(this.variants && this.variants.length > 0) {
            for(let variant of this.variants) {
              this.setVariantByType(variant);
            }
          }
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {

    if (!this.variant.type) this.variant.type = null;
    if (!this.variant.value) this.variant.value = null;

    this.variantForm.setValue({
      'type': this.variant.type,
      'value': this.variant.value
    });
  }

  public refreshValues(): void {

    if (this.variantTypeSelected) {
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

    let query = 'where="type":"' + variantType._id + '"&sort="order":1,"description":1';

    this._variantValueService.getVariantValues(query).subscribe(
      result => {
        if (!result.variantValues) {
          this.loading = false;
          this.variantValues = new Array();
        } else {
          this.hideMessage();
          this.loading = false;
          this.variantValues = result.variantValues;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public addVariant(): void {

    //Capturamos los valores del formulario de la variante a añadir
    this.variant = this.variantForm.value;

    //Comprobamos que la variante no existe
    if (!this.variantExists(this.variant)) {

      this.variant.articleParent = this.article;
      this.variants.push(this.variant);
      this.setVariantByType(this.variant);
      this.eventAddVariants.emit(this.variants);
      let variantTypeAux = this.variant.type;
      this.variant = new Variant();
      this.variant.type = variantTypeAux;
      this.setValueForm();
      this.buildForm();
    } else {
      this.showMessage("La variante " + this.variant.type.name + " " + this.variant.value.description + " ya existe", 'info', true);
    }
  }

  private setVariantByType(variant: Variant): void {

    let exist: boolean = false;

    for(let v of this.variantsByTypes) {
      if(v.type._id === variant.type._id) {
        exist = true;
        v.value.push(variant.value);
        v.value = this.orderByPipe.transform(v.value, ['description']);
        v.value = this.orderByPipe.transform(v.value, ['order']);
      }
    }

    if(!exist) {
      this.variantsByTypes.push({
        type: variant.type,
        value: [variant.value]
      });
      this.variantsByTypes = this.orderByPipe.transform(this.variantsByTypes, ['type'], 'name');
      this.variantsByTypes = this.orderByPipe.transform(this.variantsByTypes, ['type'], 'order');
    }
  }

  public deleteVariant(v) {

    let countvt: number = 0;

    for (let vt of this.variantsByTypes) {
      let typeId = v.type;
      if (v.type && v.type._id) {
        typeId = v.type._id;
      }
      if (vt.type._id === typeId) {
        let countval: number = 0;
        let delval: number = -1;
        for(let val of vt.value) {
          if (val._id == v._id) {
            delval = countval;

          }
          countval++;
        }
        if(delval !== -1) {
          vt.value.splice(delval, 1);
        }
        if(vt.value.length === 0) {
          this.variantsByTypes.splice(countvt, 1);
        }
      }
      countvt++;
    }

    if (this.variants && this.variants.length > 0) {
      let countvar: number = 0;
      let delvar: number = -1;
      for (let variantAux of this.variants) {
        if (variantAux.value._id === v._id) {
          delvar = countvar;
        }
        countvar++;
      }
      if (delvar !== -1) {
        this.variants.splice(delvar, 1);
      }
    }
    this.eventAddVariants.emit(this.variants);
  }

  public variantExists(variant: Variant): boolean {

    let exists: boolean = false;

    if (this.variants && this.variants.length > 0) {
      for (let variantAux of this.variants) {
        if (variantAux.type._id === variant.type._id &&
          variantAux.value._id === variant.value._id) {
          exists = true;
        }
      }
    }

    return exists;
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
