import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Table, TableState } from './../../models/table';

import { TableService } from './../../services/table.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { TurnService } from './../../services/turn.service';
import { UserService } from './../../services/user.service';

import { TableComponent } from '../table/table.component';
import { TransactionType } from 'app/models/transaction-type';

@Component({
  selector: 'app-list-tables',
  templateUrl: './list-tables.component.html',
  styleUrls: ['./list-tables.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListTablesComponent implements OnInit {

  public tableSelected: Table;
  public tables: Table[];
  public areTablesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public amountOfDinersNow: number = 0;
  public amountOfDiners: number = 0;
  public loading: boolean = false;
  @Input() filterRoom: string;
  @Output() eventTableSelected: EventEmitter<Table> = new EventEmitter<Table>();
  public itemsPerPage = 10;
  public totalItems = 0;
  public transactionTypeDefectOrder: TransactionType;

  constructor(
    public _tableService: TableService,
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _turnService: TurnService,
    public _userService: UserService,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {
    if (this.filterRoom === undefined) {
      this.filterRoom = '';
    }
  }

  ngOnInit(): void {

    this.tables = new Array();
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getTables();
  }

  public getTables(): void {

    this.loading = true;

    this._tableService.getTables().subscribe(
      result => {
        if (!result.tables) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.tables = new Array();
          this.areTablesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.tables = result.tables;
          this.totalItems = this.tables.length;
          this.areTablesEmpty = false;
          this.calculateAmountOfDiners();
        }
      },
      error => {
        if (error.status === 0) {
          this.showMessage("Error al conectar con el servidor. Corroborar que este encendido.", 'danger', false);
        } else {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      }
    );
  }

  public selectTable(table: Table): void {
    this.eventTableSelected.emit(table);
  }

  public calculateAmountOfDiners() {

    this.amountOfDiners = 0;
    this.amountOfDinersNow = 0;

    for(let table of this.tables) {
      this.amountOfDiners += table.chair;
      if ( table.state === TableState.Busy ||
          table.state === TableState.Pending) {
            this.amountOfDinersNow += table.diners;
      }
    }
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
    this.getTables();
  }

  public openModal(op: string, table: Table): void {

    let modalRef;

    switch (op) {
      case 'view':
        modalRef = this._modalService.open(TableComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.tableId = table._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = op;
        break;
      case 'add':
        modalRef = this._modalService.open(TableComponent, { size: 'lg', backdrop: 'static' })
        modalRef.componentInstance.operation = op;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getTables();
        }, (reason) => {
          this.getTables();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(TableComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = op;
        modalRef.componentInstance.tableId = table._id;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getTables();
        }, (reason) => {
          this.getTables();
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(TableComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = op;
        modalRef.componentInstance.tableId = table._id;
        modalRef.componentInstance.readonly = true;
        modalRef.result.then((result) => {
          this.getTables();
        }, (reason) => {
          this.getTables();
        });
        break;
      default: ;
    }
  };

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
