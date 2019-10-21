import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';


import { ArticleTypeService } from '../../services/article-type.service';

import { ArticleType } from '../../models/article-type';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';


@Component({
  selector: 'app-article-type',
  templateUrl: './article-type.component.html',
  styleUrls: ['./article-type.component.css']
})
export class ArticleTypeComponent implements OnInit {

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() articleTypeId : string;
  public alertMessage: string = '';
  public userType: string;
  public articleType: ArticleType;
  public areArticleTypeEmpty: boolean = true;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public userCountry: string;
  public articleTypeForm: FormGroup;
  public orientation: string = 'horizontal';

  public formErrors = {
    'name': '',
  };

  public validationMessages = {
    'name': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public alertConfig: NgbAlertConfig,
    public _articleTypeService: ArticleTypeService,
    public _router: Router,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
  ) {
    if(window.screen.width < 1000) this.orientation = 'vertical';
    this.articleType = new ArticleType();
  }

  ngOnInit() {
    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];;
    this.buildForm();
    
    if (this.articleTypeId) {
      this.getArticleType();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getArticleType() {

    this.loading = true;

    this._articleTypeService.getArticleType(this.articleTypeId).subscribe(
      result => {
        if (!result.articleType) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.articleType = result.articleType;
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {

   
    if (!this.articleType._id) { this.articleType._id = ''; }
    if (!this.articleType.name) { this.articleType.name = ''; }


    const values = {
      '_id': this.articleType._id,
      'name': this.articleType.name
    };
    this.articleTypeForm.setValue(values);
  }

  public buildForm(): void {

    this.articleTypeForm = this._fb.group({
      '_id' : [this.articleType._id, []],
      'name': [this.articleType.name, [
        Validators.required
        ]
      ]
    });

    this.articleTypeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.articleTypeForm) { return; }
    const form = this.articleTypeForm;

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

  public addArticleType() {

    switch (this.operation) {
      case 'add':
        this.saveArticleType();
        break;
      case 'edit':
        this.updateArticleType();
        break;
      case 'delete' :
        this.deleteArticleType();
      default:
        break;
    }
  }

  public updateArticleType() {

    this.loading = true;

    this.articleType = this.articleTypeForm.value;

    this._articleTypeService.updateArticleType(this.articleType).subscribe(
      result => {
        if (!result.articleType) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.loading = false;
          this.showMessage('El tipo se ha actualizado con éxito.', 'success', false);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveArticleType() {

    this.loading = true;

    this.articleType = this.articleTypeForm.value;

    this._articleTypeService.saveArticleType(this.articleType).subscribe(
      result => {
        if (!result.articleType) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.loading = false;
            this.showMessage('El tipo se ha añadido con éxito.', 'success', false);
            this.articleType = new ArticleType();
            this.buildForm();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteArticleType() {

    this.loading = true;

    this._articleTypeService.deleteArticleType(this.articleType._id).subscribe(
      result => {
        this.loading = false;
        if (!result.articleType) {
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.activeModal.close();
        }
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
