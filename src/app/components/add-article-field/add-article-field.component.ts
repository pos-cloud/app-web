import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ArticleField, ArticleFieldType } from './../../models/article-field';

import { ArticleFieldService } from './../../services/article-field.service';

@Component({
  selector: 'app-add-article-field',
  templateUrl: './add-article-field.component.html',
  styleUrls: ['./add-article-field.component.css'],
  providers: [NgbAlertConfig]
})

export class AddArticleFieldComponent  implements OnInit {

  public articleField: ArticleField;
  public articleFieldForm: FormGroup;
  public alertMessage: string = '';
  public types: ArticleFieldType[] = [ ArticleFieldType.Percentage, ArticleFieldType.Number, ArticleFieldType.String ];
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public resultUpload;

  public formErrors = {
    'name': '',
    'value': ''
  };

  public validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _articleFieldService: ArticleFieldService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.articleField = new ArticleField ();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.articleFieldForm = this._fb.group({
      'name': [this.articleField.name, [
          Validators.required
        ]
      ],
      'type': [this.articleField.type, [
        ]
      ],
      'value': [this.articleField.value, [
        ]
      ],
      'modify': [this.articleField.modify, [
        ]
      ],
    });

    this.articleFieldForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.articleFieldForm) { return; }
    const form = this.articleFieldForm;

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

  public addArticleField(): void {
    this.loading = true;
    this.articleField = this.articleFieldForm.value;
    this.saveArticleField();
  }

  public saveArticleField(): void {
    
    this.loading = true;
    
    this._articleFieldService.saveArticleField(this.articleField).subscribe(
      result => {
        if (!result.articleField) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
          this.loading = false;
        } else {
          this.articleField = result.articleField;
          this.showMessage("El campo de producto se ha añadido con éxito.", 'success', false);
          this.articleField = new ArticleField();
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

  public hideMessage():void {
    this.alertMessage = '';
  }
}