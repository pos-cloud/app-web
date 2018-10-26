import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//model
import { Make } from "../../models/make";
import { Category } from "../../models/category";

//service
import { ArticleService } from "../../services/article.service";
import { MakeService } from './../../services/make.service';
import { CategoryService } from './../../services/category.service';


@Component({
  selector: 'app-update-article-price',
  templateUrl: './update-article-price.component.html',
  styleUrls: ['./update-article-price.component.css']
})
export class UpdateArticlePriceComponent implements OnInit {

  public updatePriceForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public makes: Make;
  public categories: Category;
  public optionUpdate: string = "make";


  public formErrors = {
    'optionUpdate': '',
    'make': '',
    'category': '',
    'percentage': '',
    'field': ''
  };

  public validationMessages = {
    'optionUpdate': {
      'required':       'Este campo es requerido.'
    },
    'percentage': {
      'required':       'Este campo es requerido.'
    },
    'field' : {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _articleService: ArticleService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _makeService: MakeService,
    public _categoryService: CategoryService,
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getMakes();
    this.buildForm();

  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getMakes(): void {

    this.loading = true;

    this._makeService.getMakes().subscribe(
      result => {
        if (!result.makes) {
          this.getCategories();
        } else {
          this.hideMessage();
          this.makes = result.makes;
          this.getCategories();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getCategories(): void {

    this.loading = true;

    this._categoryService.getCategories().subscribe(
      result => {
        if (!result.categories) {
          this.hideMessage();
        } else {
          this.hideMessage();
          this.categories = result.categories;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }


  public buildForm(): void {

    this.updatePriceForm = this._fb.group({
      'optionUpdate': [this.optionUpdate, [
        ]
      ],
      'make': [,[]],
      'category': [, []],
      'percentage': [,[]],
      'field':[,[]]
    });

    this.updatePriceForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.updatePriceForm) { return; }
    const form = this.updatePriceForm;

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

  public updatePrice(): void {

    this.loading = true;

    let where;


    switch (this.updatePriceForm.value.optionUpdate) {
      case "make":
          where = '{"make":"' + this.updatePriceForm.value.make + '"}';
        break;
      case "category":
          where = '{"category":"' + this.updatePriceForm.value.category + '"}';
      break;
      default:where = '{}'
        break;
    }


    let query = ' { "where":'+where+', "percentage":"'+ this.updatePriceForm.value.percentage +'", "field":"'+ this.updatePriceForm.value.field +'" }'

    this._articleService.updatePrice(query).subscribe(
      result => {
        if (result.status === "Error") {
          this.showMessage("Hubo uno error en la actualización. Se actualizaron correctamente " + result.count + ".No se actualizaron:" + result.articleFailure, 'info', true);
        } else {
          this.showMessage("La lista se actualizo con éxito. Se actualizaron " + result.count + " productos", 'success', false);
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
