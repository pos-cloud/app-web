import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { PriceListService } from 'app/services/price-list.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PriceList } from 'app/models/price-list';
import { Category } from 'app/models/category';
import { Make } from 'app/models/make';
import { CategoryService } from 'app/services/category.service';
import { MakeService } from 'app/services/make.service';
import { IfStmt } from '@angular/compiler';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.component.html',
  styleUrls: ['./price-list.component.scss'],
  providers: [NgbAlertConfig]
})
export class PriceListComponent implements OnInit {

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
  
  public formErrors = {
    'name' : '',
    'percentage' : '',
    'allowSpecialRules' : ''
  };

  public validationMessages = {
    'name': { 
      'required': 'Este campo es requerido.'
     },
    'percentage': {  'required': 'Este campo es requerido.'
      },
    'allowSpecialRules': { 'required': 'Este campo es requerido.'  }
  };

  constructor(
    public _priceListService: PriceListService,
    public _categoryService: CategoryService,
    public _makeService: MakeService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    this.getCategories();
    this.getMakes();
  }

  ngOnInit() {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.priceList = new PriceList();
    this.buildForm();

    if (this.priceListId) {
      this.getListPrice();
    }

  }
  

  public buildForm(): void {

    this.priceListForm = this._fb.group({
      '_id' : [this.priceList._id, []],
      'name' : [this.priceList.name,[
      ]],
      'percentage' : [this.priceList.percentage,[
      ]],
      'allowSpecialRules' : [this.priceList.allowSpecialRules,[
      ]],
       'rules' : this._fb.array([
        /*this._fb.group({
          _id: null,
          make: null,
          category: null,
          percentage: 0
        })*/
      ])
    });

    this.priceListForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  myClickHandler(e : any){
    console.log(e)
  }

  public addNewRule(e :any): void {
    if(this.priceListForm.value.rules.lenght <= 0 && e){
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

  public addRule(): void {
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

  deleteRule(index) {
    let control = <FormArray>this.priceListForm.controls.rules;
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

  public getListPrice() {

    this.loading = true;

    this._priceListService.getPriceList(this.priceListId).subscribe(
      result => {
        if (!result.priceList) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.priceList = result.priceList;
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
    if (!this.priceList.percentage) { this.priceList.percentage = 0; }
    if (!this.priceList.allowSpecialRules === undefined) { this.priceList.allowSpecialRules = false; }

    const values = {
      '_id': this.priceList._id,
      'name': this.priceList.name,
      'percentage' : this.priceList.percentage,
      'allowSpecialRules' : this.priceList.allowSpecialRules
    };

    let control = <FormArray>this.priceListForm.controls.rules;
    this.priceList.rules.forEach(x => {
      control.push(this._fb.group({ 
        '_id': x._id, 
        'percentage': x.percentage,
        'make' : x.make,
        'category' : x.category
      }))
    })

    this.priceListForm.patchValue(values);
    
  }

  public addPriceList() {

    switch (this.operation) {
      case 'add':
        this.saveListPrice();
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

  public saveListPrice() {

    this.loading = true;

    console.log(this.priceListForm.value);

    this.priceList = this.priceListForm.value;

    console.log(this.priceList);

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

  public getCategories(){
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

  public getMakes(){
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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }

}
