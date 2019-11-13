import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { PriceListService } from 'app/services/price-list.service';
import { FormBuilder, FormGroup, Validators, FormArray, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PriceList } from 'app/models/price-list';
import { Category } from 'app/models/category';
import { Make } from 'app/models/make';
import { CategoryService } from 'app/services/category.service';
import { MakeService } from 'app/services/make.service';
import { ArticleService } from 'app/services/article.service';
import { Article } from 'app/models/article';

import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.component.html',
  styleUrls: ['./price-list.component.scss'],
  providers: [NgbAlertConfig]
})
export class PriceListComponent implements OnInit {


  public searchArticles = (text$: Observable<string>) =>
  text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => this.loading = true),
    switchMap(term =>
      this.getArticles2(`where="description": { "$regex": "${term}", "$options": "i" }&limit=10`).then(
        articles => {
          return articles;
        }
      )
    ),
    tap(() => this.loading = false)
  )

  public formatterArticles = (x: {description: string}) => x.description;

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() priceListId : string;
  public priceList: PriceList;
  public priceListForm: FormGroup;
  public rules: FormArray;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public categories : Category[];
  public makes : Make[]
  public articles : Article[]
  public viewRules : boolean = false;
  public categorySelected : Category;
  public makeSelected : Make;
  public percentageSelected : number;
  public orientation: string = 'horizontal';
  
  public formErrors = {
    'name' : '',
    'allowSpecialRules' : ''
  };

  public validationMessages = {
    'name': { 
      'required': 'Este campo es requerido.'
    },
    'allowSpecialRules': { 
      'required': 'Este campo es requerido.'  
    }
  };

  constructor(
    public _priceListService: PriceListService,
    public _categoryService: CategoryService,
    public _makeService: MakeService,
    public _articleService : ArticleService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    if(window.screen.width < 1000) this.orientation = 'vertical';
    this.getCategories();
    this.getMakes();
    this.getArticles();
  }

  ngOnInit() {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.priceList = new PriceList();
    this.buildForm();

    if (this.priceListId) {
      this.getPriceList();
    }

  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }
  

  public buildForm(): void {

    this.priceListForm = this._fb.group({
      '_id' : [this.priceList._id, []],
      'name' : [this.priceList.name,[
        Validators.required
      ]],
      'percentage' : [this.priceList.percentage,[
      ]],
      'allowSpecialRules' : [this.priceList.allowSpecialRules,[
        Validators.required
      ]],
       'rules' : this._fb.array([]),
       'exceptions' : this._fb.array([])
    });

    this.priceListForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public addNewRule(e :any): void {
    if(this.priceListForm.value.rules.lenght <= 0 && e) {
      const rules = this.priceListForm.controls.rules as FormArray;
      rules.push(
        this._fb.group({
          _id: null,
          make: null,
          category: null,
          percentage: 0
        })
      );
    }
  }

  public addNewException(e :any): void {
    if(this.priceListForm.value.exceptions.lenght <= 0 && e) {
      const exceptions = this.priceListForm.controls.exceptions as FormArray;
      exceptions.push(
        this._fb.group({
          _id: null,
          article: null,
          percentage: 0
        })
      );
    }
  }

  public addRule(ruleForm: NgForm): void {

    let valid = true;
    const rules = this.priceListForm.controls.rules as FormArray;

    if((ruleForm.value.make == '' || ruleForm.value.make == null) && (ruleForm.value.category == '' || ruleForm.value.category == null)) {
      this.showMessage("No puede seleccionar Todos los Rubros y Todas las Marcas","danger",true)
      valid = false;
    }

    if(ruleForm.value.percentage == '' || ruleForm.value.percentage == 0 || ruleForm.value.percentage == null ) {
      this.showMessage("El porcentaje no puede ser 0","danger",true)
      valid = false;
    }

    this.priceListForm.controls.rules.value.forEach(element => {

      if(ruleForm.value.make == element.make && ruleForm.value.category == element.category) {
        this.showMessage("Esta regla ya existe","danger",true)
        valid = false;
      } 

    });

    if(valid) {
      rules.push(
        this._fb.group({
          _id: null,
          make: ruleForm.value.make || null,
          category: ruleForm.value.category || null,
          percentage: ruleForm.value.percentage
        })
      );
      ruleForm.resetForm();
    }
      
  }

  public addException(exceptionForm: NgForm): void {

    let valid = true;
    const exceptions = this.priceListForm.controls.exceptions as FormArray;

    this.priceListForm.controls.exceptions.value.forEach(element => {

      if(exceptionForm.value.article == element.article) {
        this.showMessage("Esta excepcion ya existe","danger",true)
        valid = false;
      } 

    });

    if(exceptionForm.value.percentage == '' || exceptionForm.value.percentage == 0 || exceptionForm.value.percentage == null ) {
      this.showMessage("El porcentaje no puede ser 0 o vacio","danger",true)
      valid = false;
    }

    if(exceptionForm.value.article == '' || exceptionForm.value.article == 0 || exceptionForm.value.article == null ) {
      this.showMessage("Debe seleccionar un producto","danger",true)
      valid = false;
    }

    if(valid) {
      exceptions.push(
        this._fb.group({
          _id: null,
          article: exceptionForm.value.article || null,
          percentage: exceptionForm.value.percentage
        })
      );
      exceptionForm.resetForm();
    }
      
  }

  deleteRule(index) {
    let control = <FormArray>this.priceListForm.controls.rules;
    control.removeAt(index)
  }

  deleteException(index) {
    let control = <FormArray>this.priceListForm.controls.exceptions;
    control.removeAt(index)
  }


  public onValueChanged(data?: any): void {

    if (!this.priceListForm) { return; }
    const form = this.priceListForm;

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

  public getPriceList() {

    this.loading = true;

    this._priceListService.getPriceList(this.priceListId).subscribe(
      result => {
        if (!result.priceList) {  
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.priceList = result.priceList;
          if(this.priceList.allowSpecialRules) {
            this.viewRules = true;
          }
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

    if (!this.priceList._id) { this.priceList._id = ''; }
    if (!this.priceList.name) { this.priceList.name = ''; }
    if (!this.priceList.percentage) { this.priceList.percentage = null; }
    if (!this.priceList.allowSpecialRules === undefined) { this.priceList.allowSpecialRules = false; }

    const values = {
      '_id': this.priceList._id,
      'name': this.priceList.name,
      'percentage' : this.priceList.percentage,
      'allowSpecialRules' : this.priceList.allowSpecialRules
    };

    if(this.priceList.rules && this.priceList.rules.length > 0) {
      let rules = <FormArray>this.priceListForm.controls.rules;
      this.priceList.rules.forEach(x => {

        let categoryId;
        if(x.category && x.category._id) {
          categoryId = x.category._id;
        }

        let makeId;
        if(x.make && x.make._id) {
          makeId = x.make._id;
        }

        rules.push(this._fb.group({
          '_id': null, 
          'percentage': x.percentage,
          'make' : makeId,
          'category' : categoryId
        }))
      })
    }
    

    if(this.priceList.exceptions && this.priceList.exceptions.length > 0) {
      let exceptions = <FormArray>this.priceListForm.controls.exceptions;
      this.priceList.exceptions.forEach(x => {

        let articleId;
        if(x.article && x.article._id) {
          articleId = x.article._id;
        }

        exceptions.push(this._fb.group({ 
          '_id': null, 
          'article' : articleId,
          'percentage': x.percentage,
        }))
      })
    }
    

    this.priceListForm.patchValue(values);
    
  }

  public addPriceList() {

    switch (this.operation) {
      case 'add':
        this.savePriceList();
        break;
      case 'edit':
        this.updatePriceList();
        break;
      case 'delete' :
        this.deletePriceList();
      default:
        break;
    }
  }

  public updatePriceList() {

    this.loading = true;

    this.priceList = this.priceListForm.value;

    this._priceListService.updatePriceList(this.priceList).subscribe(
      result => {
        if (!result.priceList) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.loading = false;
          this.showMessage('La lista de precios se ha actualizado con éxito.', 'success', false);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public savePriceList() {

    this.loading = true;

    this.priceList = this.priceListForm.value;

    this._priceListService.savePriceList(this.priceList).subscribe(
      result => {
        if (!result.priceList) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.loading = false;
            this.showMessage('La lista de precios se ha añadido con éxito.', 'success', false);
            this.priceList = new PriceList();
            this.buildForm();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deletePriceList() {

    this.loading = true;

    this._priceListService.deletePriceList(this.priceList._id).subscribe(
      result => {
        this.loading = false;
        if (!result.priceList) {
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

  public getCategories() {
    this.loading = true;

    let query = 'sort="description":1';

    this._categoryService.getCategories(query).subscribe(
      result => {
        if (!result.categories) {
          this.loading = false;
          this.categories = new Array();
        } else {
          this.hideMessage();
          this.loading = false;
          this.categories = result.categories;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getMakes() {
    this.loading = true;

    this._makeService.getMakes().subscribe(
        result => {
          if (!result.makes) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
            this.makes = new Array();
          } else {
            this.hideMessage();
            this.loading = false;
            this.makes = result.makes;
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  public getArticles() {
    this.loading = true;

    this._articleService.getArticles().subscribe(
        result => {
          if (!result.articles) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
            this.articles = new Array();
          } else {
            this.hideMessage();
            this.loading = false;
            this.articles = result.articles;
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  
  private getArticles2(query): Promise<Article[]> {

    return new Promise((resolve, reject) => {
      
      this._articleService.getArticles(query).subscribe(
          result => {
            if (!result.articles) {
              resolve(null);
            } else {
              resolve(result.articles);
            }
          },
          error => {
            resolve(null);
          }
        );
    });
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
