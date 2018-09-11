import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ArticleFields } from './../../models/article-fields';
import { ArticleField } from './../../models/article-field';

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
  @Input() fields: ArticleFields[] = new Array();
  public articleFieldsForm: FormGroup;
  public alertMessage: string = '';
  public userValue: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  @Output() eventAddArticleFields: EventEmitter<ArticleFields[]> = new EventEmitter<ArticleFields[]>();

  public formErrors = {
    'articleField': '',
    'name': '',
    'type': '',
    'value': '',
  };

  public validationMessages = {
    'articleField': {
      'required': 'Este campo es requerido.'
    },
    'name': {
      'required': 'Este campo es requerido.'
    },
    'type': {
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

    let pathLocation: string[] = this._router.url.split('/');
    this.userValue = pathLocation[1];
    this.field = new ArticleFields();
    this.articleFields = new Array();
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
      'name': [this.field.name, [
          Validators.required
        ]
      ],
      'type': [this.field.type, [
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
    console.log("changeValues");
    this.field.articleField = this.articleFieldsForm.value.articleField;
    this.field.name = this.field.name;
    this.field.type = this.field.type;
    this.field.value = this.field.value;
    console.log(this.field);
    this.setValueForm();
  }

  public setValueForm(): void {
    console.log("setValueForm");

    const values = {
      'articleField': this.field.articleField,
      'name': this.field.articleField.name,
      'type': this.field.articleField.type,
      'value' : this.field.articleField.value
    };

    console.log(values);

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
    console.log("addArticleFields");
    this.field = this.articleFieldsForm.value;
    this.fields.push(this.field);
    this.eventAddArticleFields.emit(this.fields);
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