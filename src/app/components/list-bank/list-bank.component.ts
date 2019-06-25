import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { BankService } from '../../services/bank.service'
import { Bank } from '../../models/bank'
import { BankComponent } from '../bank/bank.component'
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';


@Component({
  selector: 'app-list-bank',
  templateUrl: './list-bank.component.html',
  styleUrls: ['./list-bank.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListBankComponent implements OnInit {

  public alertMessage: string = '';
  public userType: string;
  public banks: Bank[] = new Array();
  public relationOfBankEmpty: boolean = true;
  public orderTerm: string[] = ['-code'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public userCountry: string;

  public itemsPerPage = 10;
  public totalItems = 0;

  public currentPage: number = 0;
  public displayedColumns = [
    "code",
    "agency",
    "name",
    "account",
    "operationType"
  ];
  public filters: any[];
  public filterValue: string;

  constructor(
    public alertConfig: NgbAlertConfig,
    public bankService: BankService,
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
    this.getBanks()
  }

  public getBanks() : void {

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
    let project = '{}';
    if (this.displayedColumns && this.displayedColumns.length > 0) {
        project = '{';
        for (let i = 0; i < this.displayedColumns.length; i++) {
            let field = this.displayedColumns[i];
            project += `"${field}":{"$cond":[{"$eq":[{"$type":"$${field}"},"date"]},{"$dateToString":{"date":"$${field}","format":"%d/%m/%Y"}},{"$cond":[{"$ne":[{"$type":"$${field}"},"array"]},{"$toString":"$${field}"},"$${field}"]}]}`;
            if (i < this.displayedColumns.length - 1) {
                project += ',';
            }
        }
        project += '}';
    }
    project = JSON.parse(project);

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        banks: { $push: "$$ROOT" }
    };

    let page = 0;
    if(this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
                0 // SKIP

    this.bankService.getBanks(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        this.itemsPerPage, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        if (result.banks) {
          this.loading = false;
          this.banks = result.banks;
          this.totalItems = result.count;
          this.relationOfBankEmpty = false;
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
    this.getBanks();
  }

  public orderBy(term: string): void {

      if (this.orderTerm[0] === term) {
        this.orderTerm[0] = "-" + term;
      } else {
        this.orderTerm[0] = term;
      }
      this.getBanks();
  }

  public openModal (op: string, bank?: Bank) : void {

    let modalRef
    switch (op) {
      case 'add':
        modalRef = this._modalService.open(BankComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "add";
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getBanks();
        }, (reason) => {
          this.getBanks();
        });
        break;
      case 'edit':
        modalRef = this._modalService.open(BankComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "edit";
        modalRef.componentInstance.bankId = bank._id;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getBanks();
        }, (reason) => {
          this.getBanks();
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(BankComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "delete";
        modalRef.componentInstance.bankId = bank._id;
        modalRef.componentInstance.readonly = true;
        modalRef.result.then((result) => {
          this.getBanks();
        }, (reason) => {
          this.getBanks();
        });
        break;
      case 'view':
        modalRef = this._modalService.open(BankComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "view";
        modalRef.componentInstance.bankId = bank._id;
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
    this.getBanks();
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

