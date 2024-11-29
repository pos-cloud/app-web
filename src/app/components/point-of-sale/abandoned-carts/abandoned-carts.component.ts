import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import 'moment/locale/es';

import { Config } from 'app/app.config';
import { Company, CompanyType } from 'app/components/company/company';
import { Table } from 'app/components/table/table';

import { EmployeeType } from '@types';
import { MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { Printer } from 'app/components/printer/printer';
import { Room } from 'app/components/room/room';
import {
  TransactionMovement,
  TransactionType,
} from 'app/components/transaction-type/transaction-type';
import {
  Transaction,
  TransactionState,
} from 'app/components/transaction/transaction';
import { ViewTransactionComponent } from 'app/components/transaction/view-transaction/view-transaction.component';
import { User } from 'app/components/user/user';
import { TransactionService } from 'app/core/services/transaction.service';
import { UserService } from 'app/core/services/user.service';
import { DeleteTransactionComponent } from 'app/shared/components/delete-transaction/delete-transaction.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-abandoned-carts',
  templateUrl: './abandoned-carts.component.html',
  styleUrls: ['./abandoned-carts.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe],
  encapsulation: ViewEncapsulation.None,
})
export class AbandonedCartsComponent implements OnInit {
  public rooms: Room[] = new Array();
  public roomSelected: Room;
  public transactions: Transaction[] = new Array();
  public transactionStates: string[];
  public validTransactionStates: string[] = [
    TransactionState.Delivered.toString(),
    TransactionState.Open.toString(),
    TransactionState.Pending.toString(),
    TransactionState.Sent.toString(),
    TransactionState.Preparing.toString(),
    TransactionState.Packing.toString(),
    TransactionState.Outstanding.toString(),
    TransactionState.PaymentDeclined.toString(),
    TransactionState.PaymentConfirmed.toString(),
  ];
  public originsToFilter: number[];
  public transactionTypes: TransactionType[];
  public transactionMovement: TransactionMovement = TransactionMovement.Sale;
  public userType: string;
  public propertyTerm: string;
  public orderTerm: string[] = ['startDate'];
  public posType: string;
  public alertMessage: string = '';
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public printers: Printer[];
  @ViewChild('contentPrinters', { static: true }) contentPrinters: ElementRef;
  @Output() eventRefreshCurrentAccount: EventEmitter<any> =
    new EventEmitter<any>();
  public transaction: Transaction;
  public printerSelected: Printer;
  public employeeTypeSelected: EmployeeType;
  public tableSelected: Table;
  public config: Config;
  public transactionTypeId: string;
  private subscription: Subscription = new Subscription();
  public identity: User;
  public user: User;
  public movementsOfCashes: MovementOfCash[];

  public filterEndDate;
  public filterType;
  public filterNumber;
  public filterCompany;
  public filterOrderNumber;
  public filterState;
  filterObservation;
  filterTotalPrice;
  p;
  // CAMPOS TRAIDOS DE LA CUENTA CTE.
  @Input() company: Company;
  public companyType: CompanyType;
  @Input() totalPrice: number;

  constructor(
    public alertConfig: NgbAlertConfig,
    private _transactionService: TransactionService,
    private _modalService: NgbModal,
    private _userService: UserService,
    public translatePipe: TranslateMePipe,
    private _toastService: ToastService
  ) {
    this.roomSelected = new Room();
    this.transactionTypes = new Array();
    this.originsToFilter = new Array();
  }

  async ngOnInit() {
    this.refresh();
  }

  async refresh() {
    await this.getTransactionsV2().then((transactions) => {
      if (transactions) {
        this.transactions = transactions;
      } else {
        this._toastService.showToast({
          message: 'No se encontraron transacciones',
        });
      }
    });
  }

  public orderBy(term: string, property?: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public getTransactionsV2(): Promise<Transaction[]> {
    return new Promise<Transaction[]>((resolve, reject) => {
      this.loading = true;

      let project = {
        _id: 1,
        startDate: 1,
        endDate: 1,
        origin: 1,
        number: 1,
        orderNumber: 1,
        observation: 1,
        totalPrice: 1,
        balance: 1,
        state: 1,
        madein: 1,
        operationType: 1,
        taxes: 1,
        CAE: 1,
        'type._id': 1,
        'type.allowEdit': 1,
        'type.name': 1,
        'type.level': 1,
        'type.transactionMovement': 1,
        'type.electronics': 1,
        'type.paymentMethods': 1,
        branchOrigin: 1,
        'deliveryAddress.name': 1,
        'deliveryAddress.number': 1,
        'deliveryAddress.floor': 1,
        'deliveryAddress.flat': 1,
        'deliveryAddress.city': 1,
        'deliveryAddress.state': 1,
        'deliveryAddress.observation': 1,
        'shipmentMethod.name': 1,
        paymentMethodEcommerce: 1,
        'company.name': 1,
      };

      let match = {
        state: TransactionState.Open,
        madein: 'pedidos-web',
        totalPrice: { $gt: 0 },
        operationType: { $ne: 'D' },
        'type.transactionMovement': this.transactionMovement,
      };

      let sort: {} = { startDate: -1 };

      if (
        this.posType === 'pedidos-web' ||
        this.posType === 'carritos-abandonados'
      ) {
        sort = { endDate: 1 };
        this.orderTerm = ['endDate'];
      }

      this.subscription.add(
        this._transactionService
          .getTransactionsV2(
            project, // PROJECT
            match, // MATCH
            sort, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
          )
          .subscribe(
            (result) => {
              this.loading = false;
              if (result && result.transactions) {
                resolve(result.transactions);
              } else {
                this._toastService.showToast(result);
              }
            },
            (error) => {
              this._toastService.showToast(error._body, 'danger');
              this.loading = false;
              resolve(new Array());
            }
          )
      );
    });
  }

  public getUser(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      let identity: User = JSON.parse(sessionStorage.getItem('user'));
      let user;
      if (identity) {
        this._userService.getUser(identity._id).subscribe(
          (result) => {
            if (result && result.user) {
              resolve(result.user);
            } else {
              this._toastService.showToast(
                'Debe volver a iniciar sesión',
                'danger'
              );
            }
          },
          (error) => {
            this._toastService.showToast(error._body, 'danger');
          }
        );
      }
    });
  }

  public deleteAll() {
    this.loading = true;

    let where = {
      state: TransactionState.Open,
      madein: 'pedidos-web',
      totalPrice: { $gt: 0 },
      operationType: { $ne: 'D' },
      //"type.transactionMovement": this.transactionMovement,
    };

    this._transactionService.deleteAll({ where: where }).subscribe(
      (result) => {
        if (result && result.status === 200) {
          this._toastService.showToast(result.message);
        } else {
          if (result.status === 500) {
            this._toastService.showToast(result.error, 'danger');
          } else {
            this._toastService.showToast(result.result, 'danger');
          }
        }
        this.loading = false;
      },
      (error) => {
        this._toastService.showToast(error, 'danger');
        this.loading = false;
      }
    );
  }

  public async viewTransaction(transaction: Transaction) {
    if (transaction) {
      this.openModal('view-transaction', transaction);
    }
  }

  public async cancelTransaction(transaction: Transaction) {
    if (transaction) {
      this.openModal('cancel-transaction', transaction);
    }
  }

  async openModal(op: string, transaction: Transaction) {
    let modalRef;

    switch (op) {
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = transaction._id;
        break;
      case 'cancel-transaction':
        modalRef = this._modalService.open(DeleteTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = transaction._id;
        modalRef.result.then(
          (result) => {
            if (result === 'delete_close') {
              this.refresh();
            }
          },
          (reason) => {}
        );
        break;
      default:
    }
  }
}
