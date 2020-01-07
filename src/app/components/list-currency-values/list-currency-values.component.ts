import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { CurrencyValueService } from '../../services/currency-value.service'
import { CurrencyValue } from '../../models/currency-value'
import { CurrencyValueComponent } from '../currency-value/currency-value.component'
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';


@Component({
  selector: 'app-list-currency-values',
  templateUrl: './list-currency-values.component.html',
  styleUrls: ['./list-currency-values.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class ListCurrencyValuesComponent implements OnInit {

  public alertMessage: string = '';
  public userType: string;
  public currencyValues: CurrencyValue[] = new Array();
  public relationOfCurrencyValueEmpty: boolean = true;
  public orderTerm: string[] = ['-name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public userCountry: string;

  public itemsPerPage = 10;
  public totalItems = 0;

  public currentPage: number = 0;
  public displayedColumns = [
    "_id",
    "name",
    "value",
    "operationType"
  ];
  public filters: any[];
  public filterValue: string;

  constructor(
    public alertConfig: NgbAlertConfig,
    public _currencyValueService: CurrencyValueService,
    public _router: Router,
    public _modalService: NgbModal,
  ) {
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
   }

  ngOnInit() {
    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCurrencyValues()
  }

  public getCurrencyValues() : void {

    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sortAux;
    if (this.orderTerm[0].charAt(0) === '-') {
        sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
    } else {
        sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
    }
    sortAux = JSON.parse(sortAux);

    // FILTRAMOS LA CONSULTA

    let match = `{`;
    for(let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != "") {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
        match += ',';
      }
    }

    match += `"operationType": { "$ne": "D" } }`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      "name" : 1,
      "value" : 1,
      "operationType" : 1
    };
    

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        currencyValues: { $push: "$$ROOT" }
    };

    let page = 0;
    if(this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
                0 // SKIP

    this._currencyValueService.getCurrencyValues(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        this.itemsPerPage, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if (result && result[0] && result[0].currencyValues) {
          this.currencyValues = result[0].currencyValues;
          this.totalItems = result[0].count;
          this.relationOfCurrencyValueEmpty = false;
        } else {
          this.currencyValues = new Array();
          this.totalItems = 0;
          this.relationOfCurrencyValueEmpty = true;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
  }

  public pageChange(page): void {
    this.currentPage = page;
    this.getCurrencyValues();
  }

  public orderBy(term: string): void {

      if (this.orderTerm[0] === term) {
        this.orderTerm[0] = "-" + term;
      } else {
        this.orderTerm[0] = term;
      }
      this.getCurrencyValues();
  }

  public openModal (op: string, currencyValue?: CurrencyValue) : void {

    let modalRef
    switch (op) {
      case 'add':
        modalRef = this._modalService.open(CurrencyValueComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "add";
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getCurrencyValues();
        }, (reason) => {
          this.getCurrencyValues();
        });
        break;
      case 'edit':
        modalRef = this._modalService.open(CurrencyValueComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "edit";
        modalRef.componentInstance.currencyValueId = currencyValue._id;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getCurrencyValues();
        }, (reason) => {
          this.getCurrencyValues();
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(CurrencyValueComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "delete";
        modalRef.componentInstance.currencyValueId = currencyValue._id;
        modalRef.componentInstance.readonly = true;
        modalRef.result.then((result) => {
          this.getCurrencyValues();
        }, (reason) => {
          this.getCurrencyValues();
        });
        break;
      case 'view':
        modalRef = this._modalService.open(CurrencyValueComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "view";
        modalRef.componentInstance.currencyValueId = currencyValue._id;
        modalRef.componentInstance.readonly = true;
        modalRef.result.then((result) => {
        }, (reason) => {
        });
        break;
      default:
        break;
    }

  }

  public refresh(): void {
    this.getCurrencyValues();
  }


  public showMessage(message: string, value: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = value;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }

}
