import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

import { Taxes } from './../../models/taxes';
import { Tax } from './../../models/tax';
import { Article } from '../../models/article';

import { TaxService } from './../../services/tax.service';
import { AttrAst } from '@angular/compiler';

@Component({
  selector: 'app-add-article-tax',
  templateUrl: './add-article-tax.component.html',
  styleUrls: ['./add-article-tax.component.css'],
  providers: [NgbAlertConfig]
})

export class AddArticleTaxComponent implements OnInit {

  public articleTax: Taxes;
  public taxes: Tax[];
  @Input() articleTaxes: Taxes[] = new Array();
  public articleTaxForm: FormGroup;
  public alertMessage: string = "";
  public userValue: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  @Output() eventAddArticleTax: EventEmitter<Taxes[]> = new EventEmitter<Taxes[]>();

  public formErrors = {
    'article': '',
    'tax': '',
    'percentage': '',
    'taxBase': '',
    'taxAmount': ''
  };

  public validationMessages = {
    'article': {
    },
    'tax': {
      'required': 'Este campo es requerido.'
    },
    'percentage': {
      'required': 'Este campo es requerido.'
    },
    'taxBase': {
    },
    'taxAmount': {
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
    this.userValue = pathLocation[1];
    this.articleTax = new Taxes();
    this.taxes = new Array();
    this.getTaxes();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.articleTaxForm = this._fb.group({
      'tax': [this.articleTax.tax, [
          Validators.required
        ]
      ],
      'percentage': [this.articleTax.percentage, [
          Validators.required
        ]
      ],
      'taxBase': [this.articleTax.taxBase, [
        ]
      ],
      'taxAmount': [this.articleTax.taxAmount, [
        ]
      ]
    });

    this.articleTaxForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.articleTaxForm) { return; }
    const form = this.articleTaxForm;

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

  public setValueForm(): void {

    if (!this.articleTax.tax) this.articleTax.tax = null;
    if (!this.articleTax.percentage) this.articleTax.percentage = 21;
    if (!this.articleTax.taxBase) this.articleTax.taxBase = 0;
    if (!this.articleTax.taxAmount) this.articleTax.taxAmount = 0;

    this.articleTaxForm.setValue({
      'tax': this.articleTax.tax,
      'percentage': this.articleTax.percentage,
      'taxBase': this.articleTax.taxBase,
      'taxAmount': this.articleTax.taxAmount
    });
  }

  public getTaxes(): void {

    this.loading = true;

    this._taxService.getTaxes().subscribe(
      result => {
        if (!result.taxes) {
          this.hideMessage();
        } else {
          this.hideMessage();
          this.taxes = result.taxes;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public addArticleTax(): void {
    
    this.articleTax = this.articleTaxForm.value;
    if (!this.taxExists()) {
      this.articleTaxes.push(this.articleTax);
    }
    this.eventAddArticleTax.emit(this.articleTaxes);
  }

  public taxExists(): boolean {

    var exists: boolean = false;

    if (this.articleTaxes && this.articleTaxes.length > 0) {
      for (var taxArticleAux of this.articleTaxes) {
        if (taxArticleAux.tax._id === this.articleTax.tax._id &&
          taxArticleAux.percentage === this.articleTax.percentage) {
          exists = true;
          this.showMessage("El impuesto " + this.articleTax.tax.name + " con porcentaje " + this.articleTax.percentage + " ya existe", "info", true);
        }
      }
    }

    return exists;
  }

  public deleteArticleTax(articleTax: Taxes): void {

    let i: number = 0;
    let articleTaxToDelete: number = -1;

    if (this.articleTaxes && this.articleTaxes.length > 0) {
      for (var articleTaxAux of this.articleTaxes) {
        if (articleTax.tax._id === articleTaxAux.tax._id &&
            articleTax.percentage === articleTaxAux.percentage) {
          articleTaxToDelete = i;
        }
        i++;
      }
    }

    if (articleTaxToDelete !== -1) {
      this.articleTaxes.splice(articleTaxToDelete, 1);
    }

    this.eventAddArticleTax.emit(this.articleTaxes);
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