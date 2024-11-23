import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { ArticleFieldType } from 'app/components/article-field/article-field';
import { ArticleFields } from 'app/components/article-field/article-fields';
import { Article } from 'app/components/article/article';
import { Tax, TaxBase, TaxClassification } from 'app/components/tax/tax';
import { Transaction } from 'app/components/transaction/transaction';
import { RoundNumberPipe } from 'app/core/pipes/round-number.pipe';
import { TaxService } from 'app/core/services/tax.service';

import { Taxes } from 'app/components/tax/taxes';
import { TranslateMePipe } from 'app/core/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-article-tax',
  templateUrl: './add-article-tax.component.html',
  styleUrls: ['./add-article-tax.component.css'],
  providers: [NgbAlertConfig],
})
export class AddArticleTaxComponent implements OnInit {
  public articleTax: Taxes;
  public taxes: Tax[];
  public articleTaxForm: UntypedFormGroup;
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public roundNumber: RoundNumberPipe = new RoundNumberPipe();
  @Input() article: Article;
  @Input() otherFields: ArticleFields[];
  @Input() articleTaxes: Taxes[] = new Array();
  @Input() filtersTaxClassification: TaxClassification[];
  @Input() transaction: Transaction;
  @Input() readonly: boolean;
  @Output() eventAddArticleTax: EventEmitter<Taxes[]> = new EventEmitter<
    Taxes[]
  >();

  public formErrors = {
    tax: '',
    percentage: '',
    taxAmount: '',
  };

  public validationMessages = {
    tax: { required: 'Este campo es requerido.' },
    percentage: {},
    taxAmount: {},
  };

  constructor(
    public _taxService: TaxService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _toastr: ToastrService,
    public translatePipe: TranslateMePipe
  ) {
    this.articleTax = new Taxes();
    this.taxes = new Array();
  }

  async ngOnInit() {
    this.buildForm();
    let query;

    if (
      this.filtersTaxClassification &&
      this.filtersTaxClassification.length > 0
    ) {
      query = `where=`;
      if (
        this.filtersTaxClassification &&
        this.filtersTaxClassification.length === 1
      ) {
        query += `"classification":"${this.filtersTaxClassification[0].toString()}"`;
      } else if (
        this.filtersTaxClassification &&
        this.filtersTaxClassification.length > 1
      ) {
        let i: number = 0;

        query += `"$or":[`;
        for (let filterTaxClassification of this.filtersTaxClassification) {
          if (i > 0) {
            query += `,`;
          }
          query += `{"classification":"${filterTaxClassification.toString()}"}`;
          i++;
        }
        query += `]`;
      }
    }

    await this.getTaxes(query).then((taxes) => {
      if (taxes) {
        this.taxes = taxes;
      }
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {
    this.articleTaxForm = this._fb.group({
      tax: [this.articleTax.tax, [Validators.required]],
      percentage: [this.articleTax.percentage, []],
      taxAmount: [this.articleTax.taxAmount, []],
    });

    this.articleTaxForm.valueChanges.subscribe((data) =>
      this.onValueChanged(data)
    );

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {
    if (!this.articleTaxForm) {
      return;
    }
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
    if (!this.articleTax.percentage) this.articleTax.percentage = 0;
    if (!this.articleTax.taxAmount) this.articleTax.taxAmount = 0;

    const values = {
      tax: this.articleTax.tax,
      percentage: this.articleTax.percentage,
      taxAmount: this.articleTax.taxAmount,
    };

    this.articleTaxForm.setValue(values);
  }

  public getTaxes(query?: string): Promise<Tax[]> {
    return new Promise<Tax[]>((resolve, reject) => {
      this._taxService.getTaxes(query).subscribe(
        (result) => {
          if (!result.taxes) {
            resolve(null);
          } else {
            resolve(result.taxes);
          }
        },
        (error) => {
          this.showToast(error);
          resolve(null);
        }
      );
    });
  }

  public changeTax(op: string): void {
    if (this.articleTaxForm.value.tax) {
      let taxedAmount = 0;

      if (this.article) {
        taxedAmount = this.article.basePrice;

        if (this.otherFields && this.otherFields.length > 0) {
          for (const field of this.otherFields) {
            if (field.articleField.datatype === ArticleFieldType.Percentage) {
              field.amount = this.roundNumber.transform(
                (this.article.basePrice * parseFloat(field.value)) / 100
              );
            } else if (
              field.articleField.datatype === ArticleFieldType.Number
            ) {
              field.amount = parseFloat(field.value);
            }
            if (field.articleField.modifyVAT) {
              taxedAmount += field.amount;
            }
          }
        }
      } else if (this.transaction) {
        taxedAmount = this.transaction.basePrice;
      }

      switch (op) {
        case 'tax':
          this.articleTax.tax = this.articleTaxForm.value.tax;
          this.articleTax.percentage = this.articleTax.tax.percentage;
          this.articleTax.taxAmount = this.articleTax.tax.amount;
          if (this.articleTax.percentage && this.articleTax.percentage !== 0) {
            if (this.articleTax.tax.taxBase === TaxBase.Neto) {
              this.articleTax.taxBase = this.roundNumber.transform(taxedAmount);
              this.articleTax.taxAmount = this.roundNumber.transform(
                (this.articleTax.taxBase * this.articleTax.percentage) / 100
              );
            }
          }
          break;
        case 'percentage':
          this.articleTax.tax = this.articleTaxForm.value.tax;
          this.articleTax.percentage = this.articleTaxForm.value.percentage;
          this.articleTax.taxAmount = this.articleTax.tax.amount;
          if (this.articleTax.percentage && this.articleTax.percentage !== 0) {
            if (this.articleTax.tax.taxBase === TaxBase.Neto) {
              this.articleTax.taxBase = this.roundNumber.transform(taxedAmount);
              this.articleTax.taxAmount = this.roundNumber.transform(
                (this.articleTax.taxBase * this.articleTax.percentage) / 100
              );
            }
          }
          break;
        case 'taxAmount':
          this.articleTax.tax = this.articleTaxForm.value.tax;
          this.articleTax.taxAmount = this.articleTaxForm.value.taxAmount;
          if (this.articleTax.percentage && this.articleTax.percentage !== 0) {
            if (this.articleTax.tax.taxBase === TaxBase.Neto) {
              this.articleTax.taxBase = this.roundNumber.transform(taxedAmount);
              this.articleTaxForm.value.percentage = this.roundNumber.transform(
                (this.articleTax.taxAmount * 100) / this.articleTax.taxBase
              );
              this.articleTax.percentage = this.articleTaxForm.value.percentage;
            }
          }
          break;
        default:
          break;
      }
      this.setValueForm();
    }
  }

  public addArticleTax(): void {
    if (!this.taxExists()) {
      this.articleTaxes.push(this.articleTax);
    }
    this.articleTax = new Taxes();
    this.buildForm();
    this.eventAddArticleTax.emit(this.articleTaxes);
  }

  public taxExists(): boolean {
    let exists: boolean = false;

    if (this.articleTaxes && this.articleTaxes.length > 0) {
      for (let taxArticleAux of this.articleTaxes) {
        if (taxArticleAux.tax._id === this.articleTax.tax._id) {
          exists = true;
          this.showToast(
            null,
            'info',
            'El impuesto ' +
              this.articleTax.tax.name +
              ' con porcentaje ' +
              this.articleTax.percentage +
              ' ya existe'
          );
        }
      }
    }

    return exists;
  }

  public deleteArticleTax(articleTax: Taxes): void {
    let i: number = 0;
    let articleTaxToDelete: number = -1;

    if (this.articleTaxes && this.articleTaxes.length > 0) {
      for (let articleTaxAux of this.articleTaxes) {
        if (articleTax.tax._id === articleTaxAux.tax._id) {
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

  // public showMessage(
  //   message: string,
  //   type: string,
  //   dismissible: boolean
  // ): void {
  //   this.alertMessage = message;
  //   this.alertConfig.type = type;
  //   this.alertConfig.dismissible = dismissible;
  // }

  showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title =
          result.error && result.error.message
            ? result.error.message
            : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title)
        );
        break;
      case 'danger':
        this._toastr.error(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title)
        );
        break;
      default:
        this._toastr.info(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title)
        );
        break;
    }
    this.loading = false;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
