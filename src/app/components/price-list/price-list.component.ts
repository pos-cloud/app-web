import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { PriceListService } from 'app/services/price-list.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PriceList } from 'app/models/price-list';

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
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  
  public formErrors = {
    'code': '',
    'name' : '',
    'percentage' : '',
    'allowSpecialRules' : ''
  };

  public validationMessages = {
    'code': {
      'required': 'Este campo es requerido.'
    },
    'name': { 
      'required': 'Este campo es requerido.'
     },
    'percentage': {  'required': 'Este campo es requerido.'
      },
    'allowSpecialRules': { 'required': 'Este campo es requerido.'  }
  };

  constructor(
    public _priceListService: PriceListService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

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
      'code': [this.priceList.code, [
        Validators.required
        ]
      ],
      'name' : [this.priceList.name,[
      ]],
      'percentage' : [this.priceList.percentage,[
      ]],
      'allowSpecialRules' : [this.priceList.allowSpecialRules,[
      ]]
    });

    this.priceListForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
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
    if (!this.priceList.code) { this.priceList.code = 0; }
    if (!this.priceList.name) { this.priceList.name = ''; }
    if (!this.priceList.percentage) { this.priceList.percentage = 0; }
    if (!this.priceList.allowSpecialRules === undefined) { this.priceList.allowSpecialRules = false; }

    const values = {
      '_id': this.priceList._id,
      'code' : this.priceList.code,
      'name': this.priceList.name,
      'percentage' : this.priceList.percentage,
      'allowSpecialRules' : this.priceList.allowSpecialRules,
     
    };
    this.priceListForm.setValue(values);
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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }

}
