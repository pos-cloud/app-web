import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ArticleFields } from './../../models/article-fields';
import { ArticleField, ArticleFieldType } from './../../models/article-field';

import { ArticleFieldService } from './../../services/article-field.service';

@Component({
  selector: 'app-add-article-fields',
  templateUrl: './add-article-fields.component.html',
  styleUrls: ['./add-article-fields.component.css'],
  providers: [NgbAlertConfig]
})

export class AddArticleFieldsComponent implements OnInit {

  public field: ArticleFields;
  public articleFields: ArticleField[];
  public articleFieldsCustom : ArticleField[] = new Array();
  public articleFieldsPrice : ArticleField[] = new Array();
  @Input() fields: ArticleFields[];
  @Input() location: string;
  public articleFieldsForm: FormGroup;
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  @Output() eventAddArticleFields: EventEmitter<ArticleFields[]> = new EventEmitter<ArticleFields[]>();

  public formErrors = {
    'articleField': '',
    'value': '',
  };

  public validationMessages = {
    'articleField': {
      'required': 'Este campo es requerido.'
    },
    'value': {
      'required': 'Este campo es requerido.'
    },
  };

  constructor(
    public _articleFieldService: ArticleFieldService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    this.field = new ArticleFields();
    this.articleFields = new Array();
    if(!this.fields) {
      this.fields = new Array();
    }
    this.getArticleFields();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.articleFieldsForm = this._fb.group({
      'articleField': [this.field.articleField, [
          Validators.required
        ]
      ],
      'value': [this.field.value, [
        ]
      ]
    });

    this.articleFieldsForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.articleFieldsForm) { return; }
    const form = this.articleFieldsForm;

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

  public changeValues(): void {

    this.field.articleField = this.articleFieldsForm.value.articleField;
    this.field.articleField.name = this.field.articleField.name;
    this.field.value = this.field.articleField.value;

    this.setValueForm();
  }

  public setValueForm(): void {

    if(!this.field.articleField) { null }
    if(!this.field.value) { this.field.value = '' }

    const values = {
      'articleField': this.field.articleField,
      'value' : this.field.value
    };

    this.articleFieldsForm.setValue(values);
  }

  public getArticleFields(): void {

    this.loading = true;

    this._articleFieldService.getArticleFields().subscribe(
      result => {
        if (!result.articleFields) {
          this.hideMessage();
        } else {
          this.hideMessage();
          this.articleFields = result.articleFields;
          for (let articleField of this.articleFields) {
            if(articleField.datatype === ArticleFieldType.String || articleField.datatype === ArticleFieldType.Array) {
              this.articleFieldsCustom.push(articleField);
            } else {
              this.articleFieldsPrice.push(articleField);
            }
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

  public addArticleFields(): void {

    this.field = this.articleFieldsForm.value;

    if(!this.existsField()) {
      this.fields.push(this.field);
      this.eventAddArticleFields.emit(this.fields);
      this.field = new ArticleFields();
    } else {
      this.showMessage("El campo " + this.field.articleField.name + " ya existe.", "info", true);
    }
  }

  public existsField(): boolean {
    
    let exist: boolean = false;

    for(let field of this.fields) {
      if(field.articleField._id === this.field.articleField._id) {
        exist = true;
      }
    }

    return exist;
  }

  public deleteArticlField(articleField: ArticleFields): void {

    let i: number = 0;
    let articleTaxToDelete: number = -1;

    if (this.fields && this.fields.length > 0) {
      for (var articleTaxAux of this.fields) {
        if (articleField.articleField._id === articleTaxAux.articleField._id &&
            articleField.value === articleTaxAux.value) {
          articleTaxToDelete = i;
        }
        i++;
      }
    }

    if (articleTaxToDelete !== -1) {
      this.fields.splice(articleTaxToDelete, 1);
    }

    this.eventAddArticleFields.emit(this.fields);
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
