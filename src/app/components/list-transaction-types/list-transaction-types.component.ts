import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { TransactionType } from './../../models/transaction-type';
import { TransactionTypeService } from './../../services/transaction-type.service';

import { AddTransactionTypeComponent } from './../../components/add-transaction-type/add-transaction-type.component';
import { DeleteTransactionTypeComponent } from './../../components/delete-transaction-type/delete-transaction-type.component';

@Component({
  selector: 'app-list-transaction-types',
  templateUrl: './list-transaction-types.component.html',
  styleUrls: ['./list-transaction-types.component.css'],
  providers: [NgbAlertConfig]
})

export class ListTransactionTypesComponent implements OnInit {

  public transactionTypes: TransactionType[] = new Array();
  public areTransactionTypesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<TransactionType> = new EventEmitter<TransactionType>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _transactionTypeService: TransactionTypeService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getTransactionTypes();
  }

  public getTransactionTypes(): void {

    this.loading = true;

    this._transactionTypeService.getTransactionTypes().subscribe(
      result => {
        if (!result.transactionTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.transactionTypes = null;
          this.areTransactionTypesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.transactionTypes = result.transactionTypes;
          this.totalItems = this.transactionTypes.length;
          this.areTransactionTypesEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy(term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getTransactionTypes();
  }

  public openModal(op: string, transactionType: TransactionType): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(AddTransactionTypeComponent, { size: 'lg' });
        modalRef.componentInstance.operation = 'view';
        modalRef.componentInstance.transactionType = transactionType;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add':
        modalRef = this._modalService.open(AddTransactionTypeComponent, { size: 'lg' });
        modalRef.componentInstance.operation = 'add';
        modalRef.result.then((result) => {
          this.getTransactionTypes();
        }, (reason) => {
          this.getTransactionTypes();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(AddTransactionTypeComponent, { size: 'lg' });
        modalRef.componentInstance.operation = 'update';
        modalRef.componentInstance.transactionType = transactionType;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getTransactionTypes();
        }, (reason) => {
          this.getTransactionTypes();
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteTransactionTypeComponent, { size: 'lg' })
        modalRef.componentInstance.transactionType = transactionType;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            this.getTransactionTypes();
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public getCode(transactionType: TransactionType, letter: string): number {

    let code: number;
    if (transactionType.codes) {
      let jsonString = JSON.stringify(transactionType.codes);
      let json = JSON.parse(jsonString);
      json.find(function (x) {
        if (x.letter === letter) {
          code = x.code;
        }
      });
    }

    return code;
  }

  public addItem(transactionTypeSelected) {
    this.eventAddItem.emit(transactionTypeSelected);
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
