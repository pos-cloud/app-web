import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Currency } from '../currency';
import { CurrencyService } from '../currency.service';

import { CurrencyComponent } from '../currency/currency.component';
import { ImportComponent } from '../../import/import.component';

@Component({
  selector: 'app-list-currencies',
  templateUrl: './list-currencies.component.html',
  styleUrls: ['./list-currencies.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListCurrenciesComponent implements OnInit {

  public currencies: Currency[] = new Array();
  public areCurrenciesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['code'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<Currency> = new EventEmitter<Currency>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _currencyService: CurrencyService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCurrencies();
  }

  public getCurrencies(): void {

    this.loading = true;

    this._currencyService.getCurrencies('sort="code":1').subscribe(
        result => {
          if (!result.currencies) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
            this.currencies = new Array();
            this.areCurrenciesEmpty = true;
          } else {
            this.hideMessage();
            this.loading = false;
            this.currencies = result.currencies;
            this.totalItems = this.currencies.length;
            this.areCurrenciesEmpty = false;
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
   }

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getCurrencies();
  }

  public openModal(op: string, currency:Currency): void {

    let modalRef;
    switch(op) {
      case 'view':
        modalRef = this._modalService.open(CurrencyComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.currencyId = currency._id;
        modalRef.componentInstance.operation = "view";
        modalRef.componentInstance.readonly = true;
        break;
      case 'add' :
        modalRef = this._modalService.open(CurrencyComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "add";
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getCurrencies();
        }, (reason) => {
          this.getCurrencies();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(CurrencyComponent, { size: 'lg', backdrop: 'static' });
          modalRef.componentInstance.currencyId = currency._id;
          modalRef.componentInstance.operation = "update";
          modalRef.componentInstance.readonly = false;
          modalRef.result.then((result) => {
            if (result === 'save_close') {
              this.getCurrencies();
            }
          }, (reason) => {
            this.getCurrencies();
          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(CurrencyComponent, { size: 'lg', backdrop: 'static' });
          modalRef.componentInstance.operation = "delete";
          modalRef.componentInstance.currencyId = currency._id;
          modalRef.componentInstance.readonly = true;
          modalRef.result.then((result) => {
            if (result === 'delete_close') {
              this.getCurrencies();
            }
          }, (reason) => {

          });
          break;
      case 'import':
        modalRef = this._modalService.open(ImportComponent, { size: 'lg', backdrop: 'static' });
        let model: any = new Currency();
        model.model = "currency";
        model.primaryKey = "name";
        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          if (result === 'import_close') {
            this.getCurrencies();
          }
        }, (reason) => {

        });
        break;
      default : ;
    }
  };

  public addItem(currencySelected) {
    this.eventAddItem.emit(currencySelected);
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
