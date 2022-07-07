import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//model
import { Make } from "../../make/make";
import { Category } from "../../category/category";

//service
import { ArticleService } from "../article.service";
import { MakeService } from '../../make/make.service';
import { CategoryService } from '../../category/category.service';
import { Article } from '../article';


@Component({
  selector: 'app-update-article-price',
  templateUrl: './update-article-price.component.html',
  styleUrls: ['./update-article-price.component.css']
})
export class UpdateArticlePriceComponent implements OnInit {

  @Input() articles: Article[];
  public updatePriceForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public makes: Make;
  public categories: Category;
  public optionUpdate: string = "make";
  public decimal = 2;

  public formErrors = {
    'optionUpdate': '',
    'make': '',
    'category': '',
    'percentage': '',
    'field': '',
    'decimal' : '',
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
    },
    'decimal' : {
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

    this._makeService.getMakes('sort="description":1').subscribe(
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

    this._categoryService.getCategories('sort="description":1').subscribe(
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
          Validators.required
        ]
      ],
      'make': [, [
        ]
      ],
      'category': [, [
        ]
      ],
      'percentage': [, [
          Validators.required
        ]
      ],
      'field':[, [
          Validators.required
        ]
      ],
      'decimal': [,[Validators.required]]
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

    let areValidData: boolean = true;

    let where: string;

    switch (this.updatePriceForm.value.optionUpdate) {
      case "make":
        if(this.updatePriceForm.value.make) {
          where = '{"operationType": { "$ne": "D" }, "make":"' + this.updatePriceForm.value.make + '"}';
        } else {
          areValidData = false;
          this.showMessage("Debe cargar la marca a actualizar.", "info", true);
        }
        break;
      case "category":
          if(this.updatePriceForm.value.category) {
            where = '{"operationType": { "$ne": "D" }, "category":"' + this.updatePriceForm.value.category + '"}';
          } else {
            areValidData = false;
            this.showMessage("Debe cargar la categoría a actualizar.", "info", true);
          }
      break;
      case "make-category":
          if(this.updatePriceForm.value.category && this.updatePriceForm.value.make) {
            where = '{"operationType": { "$ne": "D" }, "category":"' + this.updatePriceForm.value.category + '", "make":"' + this.updatePriceForm.value.make + '"}';
          } else {
            areValidData = false;
            this.showMessage("Debe cargar la categoría a actualizar.", "info", true);
          }
      break;
      default:
        where = '{}'
      break;
    }


    let query = `{ 
                  "where": ${where}, 
                  "percentage": ${this.updatePriceForm.value.percentage}, 
                  "field":"${this.updatePriceForm.value.field}" 
                }`;


    if(areValidData) {

      this.loading = true;
      
      console.log(this.updatePriceForm.value.optionUpdate);
      if(this.updatePriceForm.value.optionUpdate === "filter"){
        let articles: string[] = [];
        for (const article of this.articles) {
          articles.push(article.code);
        }
        const query = {
          articlesCode : articles,
          percentage: this.updatePriceForm.value.percentage,
          field: this.updatePriceForm.value.field,
          decimal: this.updatePriceForm.value.decimal
        }
        this._articleService.updatePrice2(JSON.stringify(query)).subscribe(
          result =>{
            this.showMessage(result.message, 'success', false )
            this.loading = false;
          },
          error => {
            this.showMessage(error._body, 'danger', false);
            this.loading = false;
          }
        )
      } else {
        this._articleService.updatePrice(query,this.updatePriceForm.value.decimal).subscribe(
          result => {
            this.loading = false;
            if (result.status === "Error") {
              this.showMessage("Hubo uno error en la actualización. Se actualizaron correctamente " + result.count + ". No se actualizaron:" + result.articleFailure, 'info', true);
            } else {
              this.showMessage("La lista se actualizo con éxito. Se actualizaron " + result.countFinal + " productos y " + result.countVariants + " variantes.", 'success', false);
            }
          },
          error => {
            this.showMessage(error._body, 'danger', false);
            this.loading = false;
          }
        );
      }
    }
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
