import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Transaction } from 'app/components/transaction/transaction';
import { CapitalizePipe } from 'app/core/pipes/capitalize';
import { RoundNumberPipe } from 'app/core/pipes/round-number.pipe';
import { TranslateMePipe } from 'app/core/pipes/translate-me';
import Resulteable from 'app/util/Resulteable';
import * as moment from 'moment';
import 'moment/locale/es';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { TransactionService } from '../../transaction/transaction.service';
import { MovementOfCash } from '../movement-of-cash';
import { MovementOfCashService } from '../movement-of-cash.service';

@Component({
  selector: 'app-select-movements-of-cashes',
  templateUrl: './select-movements-of-cashes.component.html',
  styleUrls: ['./select-movements-of-cashes.component.scss'],
  providers: [TranslateMePipe],
  encapsulation: ViewEncapsulation.None,
})
export class SelectMovementsOfCashesComponent implements OnInit {
  @Input() transactionId: string;
  @Input() totalPrice: number;
  @Input() movementsOfCashes: MovementOfCash[] = new Array();
  @Input() forLiquidation: boolean;
  public loading: boolean = false;
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();
  public balanceSelected: number = 0;
  public title: string = 'Seleccionar movimientos de servicios';
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  public orderTerm: string[] = ['endDate'];
  public filters: any[];
  public amountOfInterestCalculated: number = 0;

  constructor(
    private _title: Title,
    private _movementOfCashService: MovementOfCashService,
    private _toastr: ToastrService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _transactionService: TransactionService,
    public translatePipe: TranslateMePipe
  ) {
    this.filters = new Array();
    for (let field of ['name', 'amountPaid']) {
      this.filters[field] = '';
    }
  }

  public async ngOnInit() {
    this.title = this.capitalizePipe.transform(this.title);
    this._title.setTitle(this.title);
    if (!this.movementsOfCashes || this.movementsOfCashes.length === 0) {
      this.loadMovementsOfCashes();
    }
  }

  public async ngAfterViewInit() {
    this._title.setTitle(this.title);
  }

  public recalculateBalanceSelected(): void {
    this.balanceSelected = 0;
    for (let mov of this.movementsOfCashes) {
      if (!this.forLiquidation && mov.balanceCanceled !== undefined) {
        this.balanceSelected += mov.balanceCanceled;
      } else if (this.forLiquidation && mov['liquidated']) {
        this.balanceSelected += mov.amountPaid;
      }
    }
    this.roundNumberPipe.transform(this.balanceSelected);
  }

  public deleteAllMovements(): void {
    for (let mov of this.movementsOfCashes) {
      mov.balanceCanceled = 0;
    }
    this.recalculateBalanceSelected();
  }

  public deleteMovementOfCashSelected(movementOfCash: MovementOfCash): void {
    movementOfCash.balanceCanceled = 0;
    this.recalculateBalanceSelected();
  }

  public isMovementOfCashSelected(movementOfCash: MovementOfCash) {
    if (movementOfCash.balanceCanceled === movementOfCash.amountPaid) {
      return true;
    } else {
      return false;
    }
  }

  public getMovementOfCashes(match: {}): Promise<MovementOfCash[]> {
    return new Promise<MovementOfCash[]>((resolve, reject) => {
      this.loading = true;
      /// ORDENAMOS LA CONSULTA
      let sortAux;
      if (this.orderTerm[0].charAt(0) === '-') {
        sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
      } else {
        sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
      }
      sortAux = JSON.parse(sortAux);

      let project = {
        _id: 1,
        quota: 1,
        expirationDate: 1,
        'type._id': 1,
        'type.name': 1,
        amountPaid: 1,
        transaction: 1,
        operationType: 1,
        balanceCanceled: 1,
      };
      this.subscription.add(
        this._movementOfCashService
          .getMovementsOfCashesV2(project, match, sortAux, {}, 0, 0)
          .subscribe(
            (res) => {
              this.loading = false;
              res.movementsOfCashes
                ? resolve(res.movementsOfCashes)
                : resolve([]);
            },
            (error) => reject(error)
          )
      );
    });
  }

  public async loadMovementsOfCashes() {
    if (!this.forLiquidation) {
      this.movementsOfCashes = await this.getMovementOfCashes({
        operationType: { $ne: 'D' },
        transaction: { $oid: this.transactionId },
        balanceCanceled: { $eq: 0 },
      });
    } else {
      //TRAER TODOS LOS CONTARTOS VIGENTES
      let match: {} = {};
      match['operationType'] = { $ne: 'D' };
    }
  }

  async selectMovementOfCash(movementOfCashSelected: MovementOfCash) {
    if (!this.isMovementOfCashSelected(movementOfCashSelected)) {
      movementOfCashSelected.balanceCanceled =
        movementOfCashSelected.amountPaid;
    } else {
      movementOfCashSelected.balanceCanceled = 0;
    }
    this.recalculateBalanceSelected();
  }

  public updateMovementOfCash(
    movementOfCash: MovementOfCash
  ): Promise<MovementOfCash> {
    return new Promise<MovementOfCash>((resolve, reject) => {
      this._movementOfCashService.update(movementOfCash).subscribe(
        async (result) => {
          if (result.status === 200) {
            resolve(result.result);
          } else reject(result);
        },
        (error) => reject(error)
      );
    });
  }

  public getTransaction(match: {}): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      this.loading = true;
      let project = {
        _id: 1,
        date: 1,
        person: 1,
        company: 1,
        transactionType: 1,
        totalPrice: 1,
        balance: 1,
      };
      this.subscription.add(
        this._transactionService
          .getTransactionsV2(project, match, {}, {}, 1, 0)
          .subscribe(
            (result) => {
              this.loading = false;
              resolve(result.transactions[0]);
            },
            (error) => reject(error)
          )
      );
    });
  }

  public updateTransaction(transaction: Transaction): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      this._transactionService.update(transaction).subscribe(
        (result: Resulteable) => {
          if (result.status === 200) {
            resolve(result.result);
          } else {
            this.showToast(result);
            reject(result);
          }
        },
        (error) => {
          this.showToast(error);
          reject(error);
        }
      );
    });
  }

  public async calculateTotalMovement(mov: MovementOfCash) {
    let movs = await this.getMovementOfCashes({ _id: { $oid: mov._id } });
    let priceOriginal = movs[0].amountPaid - movs[0].surcharge;
    mov.amountPaid = priceOriginal + mov.surcharge;
    this.amountOfInterestCalculated++;
  }

  public calculateDaysUntilToday(endDate: string) {
    return moment(moment(endDate).format('YYYY-MM-DD')).diff(
      moment().format('YYYY-MM-DD'),
      'days'
    );
  }

  public async finish() {
    try {
      let totalAmount: number = 0;
      if (this.amountOfInterestCalculated > 0) {
        for (let mov of this.movementsOfCashes) {
          totalAmount += mov.amountPaid;
          let lastBalanceSelected = mov.balanceCanceled;
          delete mov.balanceCanceled;
          await this.updateMovementOfCash(mov);
          mov.balanceCanceled = lastBalanceSelected;
        }
      }

      await this.getTransaction({ _id: { $oid: this.transactionId } }).then(
        async (transaction) => {
          if (this.amountOfInterestCalculated > 0) {
            transaction.totalPrice = totalAmount;
            transaction = await this.updateTransaction(transaction);
          }
        }
      );

      this.activeModal.close({
        movementsOfCashes: this.movementsOfCashes,
      });
    } catch (error) {
      this.showToast(error);
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public orderBy(term: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.loadMovementsOfCashes();
  }

  public showToast(
    result,
    type?: string,
    title?: string,
    message?: string
  ): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title =
          result.error && result.error.message
            ? result.error.message
            : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title)
        );
        break;
      case 'danger':
        this._toastr.error(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title)
        );
        break;
      default:
        this._toastr.info(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title)
        );
        break;
    }
    this.loading = false;
  }
}
