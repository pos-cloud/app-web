import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbAlertConfig, NgbAlertModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import * as printJS from 'print-js';
import { Subject, takeUntil } from 'rxjs';

import { PrintService } from '@core/services/print.service';
import { ApiResponse, CashBox, PrintType } from '@types';
import { MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { Movements } from 'app/components/transaction-type/transaction-type';
import { TransactionState } from 'app/components/transaction/transaction';
import { CashBoxService } from 'app/core/services/cash-box.service';
import { MovementOfCashService } from 'app/core/services/movement-of-cash.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FilterPipe } from 'app/shared/pipes/filter.pipe';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { RoundNumberPipe } from 'app/shared/pipes/round-number.pipe';

import { ViewTransactionComponent } from '../../transaction/components/view-transaction/view-transaction.component';

@Component({
  standalone: true,
  selector: 'app-report-cash-box',
  templateUrl: './cash-box.component.html',
  imports: [CommonModule, FormsModule, NgbAlertModule, NgxPaginationModule, PipesModule],
})
export class ReportCashBoxComponent implements OnInit, OnDestroy {
  public cashBoxSelected: CashBox;
  public movementsOfCashes: MovementOfCash[] = new Array();
  public alertMessage: string = '';
  public userType: string = '';
  public orderTerm: string[] = ['date'];
  public propertyTerm: string;
  public items: any[];
  public loading: boolean = false;
  public itemsPerPage = 10;
  public areFiltersVisible: boolean;
  public roundNumber = new RoundNumberPipe();
  public listTitle: string;
  public currentPage: number = 0;
  public areMovementOfCashesEmpty: boolean = false;
  public balance;
  public displayedColumns = [
    'type',
    'code',
    'barcode',
    'description',
    'number',
    'posDescription',
    'make.description',
    'category.description',
    'category.description',
    'costPrice',
    'salePrice',
    'transaction.type.transactionMovement',
    'transaction.type.movement',
    'transaction.type.name',
    'transaction.number',
    'type.name',
    'observation',
    'picture',
    'operationType',
  ];
  public filters: any[];
  public totalItems: number = 0;
  public filterPipe: FilterPipe = new FilterPipe();
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private _router: Router,
    public _movementOfCashService: MovementOfCashService,
    public _cashBoxService: CashBoxService,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    private _toastService: ToastService,
    public _printService: PrintService
  ) {
    this.filters = new Array();
    this.movementsOfCashes = new Array();
    for (let field of this.displayedColumns) {
      this.filters[field] = '';
    }
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      let cashBoxId = params['cashBoxId'];
      this.getCashBox(cashBoxId);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public goBackToList(): void {
    this._router.navigateByUrl('/entities/cash-boxes');
  }

  public getCashBox(cashBoxId: string) {
    this.loading = true;

    let sortAux;
    if (this.orderTerm[0].charAt(0) === '-') {
      sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
    } else {
      sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
    }
    sortAux = JSON.parse(sortAux);

    let match = `{`;
    match += `"operationType": { "$ne": "D" },
              "_id" : { "$oid" : "${cashBoxId}"}}`;
    match = JSON.parse(match);

    let project = {
      _id: 1,
      'creationUser.name': 1,
      state: 1,
      number: 1,
      openingDate: {
        $dateToString: {
          date: '$openingDate',
          format: '%d/%m/%Y %H:%M',
          timezone: '-03:00',
        },
      },
      closingDate: {
        $dateToString: {
          date: '$closingDate',
          format: '%d/%m/%Y %H:%M',
          timezone: '-03:00',
        },
      },
      operationType: 1,
    };

    let group = {
      _id: null,
      count: { $sum: 1 },
      cashBoxes: { $push: '$$ROOT' },
    };

    this._cashBoxService.getCashBoxesV2(project, match, sortAux, group).subscribe(
      (result) => {
        this.loading = false;
        if (result) {
          this.cashBoxSelected = result[0].cashBoxes[0];
          this.getMovementOfCashes();
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
  }

  public getMovementOfCashes(): void {
    this.loading = true;

    let sortAux;
    if (this.orderTerm[0].charAt(0) === '-') {
      sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
    } else {
      sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
    }
    sortAux = JSON.parse(sortAux);

    let match = `{`;
    for (let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != '') {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"},`;
      }
    }

    match += `"operationType": { "$ne": "D" },
              "transaction.state": "${TransactionState.Closed}",
              "transaction.operationType": { "$ne": "D" },
              "type.cashBoxImpact" : true }`;

    match = JSON.parse(match);

    if (this.cashBoxSelected) match['transaction.cashBox._id'] = { $oid: this.cashBoxSelected._id };

    let project = {
      _id: 1,
      'transaction.endDate': 1,
      'transaction.cashBox.number': 1,
      quota: 1,
      discount: 1,
      'transaction.number': { $toString: '$transaction.number' },
      statusCheck: 1,
      observation: 1,
      'bank._id': 1,
      'bank.name': 1,
      amountPaid: 1,
      operationType: 1,
      expirationDate: {
        $dateToString: {
          date: '$expirationDate',
          format: '%d/%m/%Y',
          timezone: '-03:00',
        },
      },
      'transaction._id': 1,
      'transaction.state': 1,
      'transaction.type.name': 1,
      'transaction.observation': 1,
      'transaction.type.transactionMovement': 1,
      'transaction.type.movement': 1,
      'transaction.cashBox._id': 1,
      date: 1,
      titular: 1,
      receiver: 1,
      'type._id': { $toString: '$type._id' },
      'type.name': 1,
      'type.cashBoxImpact': 1,
      deliveredBy: 1,
      CUIT: 1,
      'transaction.operationType': 1,
    };

    let group = {
      _id: null,
      count: { $sum: 1 },
      movementsOfCashes: { $push: '$$ROOT' },
    };

    let limit = this.itemsPerPage;
    let page = 0;
    if (this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ? page * this.itemsPerPage : 0;

    if (this.userType === 'pos') {
      limit = 0;
      skip = 0;
    }

    this._movementOfCashService.getMovementsOfCashesV2(project, match, sortAux, group).subscribe(
      (result) => {
        if (result && result[0] && result[0].movementsOfCashes) {
          this.loading = false;
          this.items = result[0].movementsOfCashes;
          this.totalItems = result[0].count;
          this.areMovementOfCashesEmpty = false;
          this.currentPage = parseFloat(
            this.roundNumber.transform(this.totalItems / this.itemsPerPage + 0.5, 0).toFixed(0)
          );
        } else {
          this.items = new Array();
          this.loading = false;
          this.totalItems = 0;
          this.areMovementOfCashesEmpty = true;
        }
        this.getBalance();
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
  }

  public getBalance(): void {
    this.balance = 0;

    let i = 0;
    for (let movementOfcash of this.items) {
      if (movementOfcash.transaction.type.movement == Movements.Inflows) {
        this.balance += movementOfcash.amountPaid;
      }
      if (movementOfcash.transaction.type.movement == Movements.Outflows) {
        this.balance -= movementOfcash.amountPaid;
      }
      this.items[i].balance = this.balance;
      i++;
    }
  }

  public openModal(op: string, movementOfCash?: MovementOfCash): void {
    let modalRef;
    switch (op) {
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = movementOfCash.transaction._id;
        break;
      case 'print':
        const dataLabels = {
          cashBoxId: this.cashBoxSelected._id,
        };
        this.toPrint(PrintType.CashBox, dataLabels);

        break;
      default:
    }
  }

  public toPrint(type: PrintType, data: {}): void {
    this.loading = true;

    this._printService
      .toPrint(type, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Blob | ApiResponse) => {
          if (!result) {
            this._toastService.showToast({ message: 'Error al generar el PDF' });
            return;
          }
          if (result instanceof Blob) {
            try {
              const blobUrl = URL.createObjectURL(result);
              printJS(blobUrl);
            } catch (e) {
              this._toastService.showToast({ message: 'Error al generar el PDF' });
            }
          } else {
            this._toastService.showToast(result);
          }
        },
        error: (error) => {
          this._toastService.showToast({ message: 'Error al generar el PDF' });
        },
        complete: () => {
          this.loading = false;
        },
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
