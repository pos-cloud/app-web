import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ArticleField, ArticleFieldType } from '../article-field';

import { ArticleFieldService } from '../article-field.service';

@Component({
  selector: 'app-update-article-field',
  templateUrl: './update-article-field.component.html',
  styleUrls: ['./update-article-field.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateArticleFieldComponent implements OnInit {

  @Input() articleField: ArticleField;
  @Input() readonly: boolean;
  public articleFieldForm: FormGroup;
  public alertMessage: string = '';
  public datatypes: ArticleFieldType[] = [ 
    ArticleFieldType.Percentage,
    ArticleFieldType.Number,
    ArticleFieldType.String, 
    ArticleFieldType.Array
  ];
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'order': '',
    'name': '',
    'value':''
  };

  public validationMessages = {
    'order': {
      'required':       'Este campo es requerido.'
    },
    'name': {
      'required':       'Este campo es requerido.'
    }
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
    this.userType = pathLocation[1];
    this.buildForm();
    this.setValueForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.articleFieldForm = this._fb.group({
      '_id': [this.articleField._id, [
        ]
      ],
      'order': [this.articleField.order, [
          Validators.required
        ]
      ],
      'name': [this.articleField.name, [
          Validators.required
        ]
      ],
      'datatype' : [this.articleField.datatype, [
        ]
      ],
      'value' : [this.articleField.value, [
        ]
      ],
      'modify' : [this.articleField.modify, [
        ]
      ],
      'modifyVAT' : [this.articleField.modifyVAT, [
        ]
      ],
      'discriminateVAT' : [this.articleField.discriminateVAT, [
        ]
      ],
      'ecommerceEnabled' : [this.articleField.ecommerceEnabled, [
      ]
    ]
    });

    this.articleFieldForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
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

  public setValueForm(): void {

    if(!this.articleField._id) { this.articleField._id = '' }
    if(!this.articleField.order) { this.articleField.order = 1 }
    if(!this.articleField.name) { this.articleField.name = '' }
    if(!this.articleField.datatype) { this.articleField.datatype = ArticleFieldType.Percentage }
    if(this.articleField.modify === undefined) { this.articleField.modify = false }
    if(this.articleField.modifyVAT === undefined) { this.articleField.modifyVAT = false }
    if(this.articleField.discriminateVAT === undefined) { this.articleField.discriminateVAT = false }
    if(this.articleField.ecommerceEnabled === undefined) { this.articleField.ecommerceEnabled = false }


    this.articleFieldForm.setValue({
      '_id':this.articleField._id,
      'order': this.articleField.order,
      'name': this.articleField.name,
      'datatype': this.articleField.datatype,
      'value': this.articleField.value,
      'modify': this.articleField.modify,
      'modifyVAT': this.articleField.modifyVAT,
      'discriminateVAT': this.articleField.discriminateVAT,
      'ecommerceEnabled': this.articleField.ecommerceEnabled

    });
  }

  public updateArticleField (): void {
    if (!this.readonly) {
      this.loading = true;
      this.articleField = this.articleFieldForm.value;
      this.saveChanges();
    }
  }

  public saveChanges(): void {

    this.loading = true;

    this._articleFieldService.updateArticleField(this.articleField).subscribe(
      result => {
        if (!result.articleField) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.articleField = result.articleField;
          this.showMessage("El campo de producto se ha actualizado con éxito.", 'success', false);
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
