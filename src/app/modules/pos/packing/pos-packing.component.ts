import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PrintType } from '@types';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { Transaction, TransactionState } from 'app/components/transaction/transaction';
import { MovementOfArticleService } from 'app/core/services/movement-of-article.service';
import { PrintService } from 'app/core/services/print.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import * as printJS from 'print-js';

@Component({
  selector: 'app-pos-packing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos-packing.component.html',
  styleUrls: ['./pos-packing.component.scss'],
})
export class PosPackingComponent implements OnInit, OnDestroy {
  public loading = false;
  public printingId = '';
  public transactionsToPacking: Transaction[] = [];

  private readonly colors = ['#0f766e', '#1d4ed8', '#b45309', '#be123c', '#6d28d9', '#047857'];
  private readonly limit = 12;
  private refreshInterval?: ReturnType<typeof setInterval>;

  constructor(
    private _transactionService: TransactionService,
    private _movementOfArticleService: MovementOfArticleService,
    private _printService: PrintService,
    private _toastService: ToastService
  ) {}

  public ngOnInit(): void {
    this.loadPacking();
    this.refreshInterval = setInterval(() => {
      if (!this.loading) {
        this.loadPacking();
      }
    }, 5000);
  }

  public ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
  }

  private async loadPacking(): Promise<void> {
    this.loading = true;
    try {
      const transactions = await this.getTransactions({
        state: TransactionState.Packing,
        operationType: { $ne: 'D' },
      });

      for (let index = 0; index < transactions.length; index++) {
        const transaction = transactions[index];
        transaction['color'] = this.colors[index % this.colors.length];
        transaction['movementsOfArticles'] = await this.getMovementsOfArticles({
          transaction: { $oid: transaction._id },
          operationType: { $ne: 'D' },
          $or: [
            { movementParent: { $exists: true, $ne: null }, isOptional: true },
            { movementParent: { $exists: false, $eq: null }, isOptional: false },
          ],
        });
      }

      this.transactionsToPacking = transactions;
    } finally {
      this.loading = false;
    }
  }

  private getTransactions(match: {}): Promise<Transaction[]> {
    return new Promise<Transaction[]>((resolve) => {
      this._transactionService
        .getTransactionsV2(
          {
            endDate: 1,
            number: 1,
            orderNumber: 1,
            'shipmentMethod.name': 1,
            state: 1,
            operationType: 1,
          },
          match,
          { endDate: 1 },
          {},
          this.limit,
          0
        )
        .subscribe(
          (result) => resolve(result.transactions || []),
          () => resolve([])
        );
    });
  }

  private getMovementsOfArticles(match: {}): Promise<MovementOfArticle[]> {
    return new Promise<MovementOfArticle[]>((resolve) => {
      this._movementOfArticleService
        .getMovementsOfArticlesV2(
          {
            _id: 1,
            description: 1,
            amount: 1,
            notes: 1,
            transaction: 1,
            operationType: 1,
            isOptional: 1,
            movementParent: 1,
          },
          match,
          {},
          {},
          0,
          0
        )
        .subscribe(
          (result) => {
            if (!result.movementsOfArticles) {
              if (result.message) {
                this._toastService.showToast(null, 'info', '', result.message);
              }
              resolve([]);
              return;
            }
            resolve(result.movementsOfArticles);
          },
          (error) => {
            this._toastService.showToast(null, 'danger', '', error?._body || 'No se pudieron cargar los productos');
            resolve([]);
          }
        );
    });
  }

  public printOrder(transaction: Transaction): void {
    if (!transaction?._id || this.printingId) {
      return;
    }
    this.printingId = transaction._id;
    this._printService.toPrint(PrintType.Packing, { transactionId: transaction._id }).subscribe({
      next: (result) => {
        this.printingId = '';
        if (!(result instanceof Blob)) {
          this._toastService.showToast({ message: 'Error al generar el PDF' });
          return;
        }
        printJS({
          printable: URL.createObjectURL(result),
          type: 'pdf',
        });
      },
      error: (error) => {
        this.printingId = '';
        this._toastService.showToast({ message: error?.message || 'Error al generar el PDF' });
      },
    });
  }

  public orderLabel(transaction: Transaction): string {
    if (transaction?.orderNumber > 0) {
      return String(transaction.orderNumber);
    }
    return transaction?.number ? String(transaction.number) : '';
  }

  public parentLines(transaction: Transaction): MovementOfArticle[] {
    const lines = transaction?.['movementsOfArticles'] || [];
    return lines.filter((line) => !line.movementParent);
  }

  public childLines(transaction: Transaction, parent: MovementOfArticle): MovementOfArticle[] {
    const lines = transaction?.['movementsOfArticles'] || [];
    return lines.filter((line) => this.sameId(line.movementParent, parent?._id));
  }

  public noteList(notes: string): string[] {
    if (!notes) {
      return [];
    }
    return notes
      .split('; ')
      .map((note) => note.trim())
      .filter((note) => note !== '');
  }

  private sameId(value: any, id: string): boolean {
    const current = value && value._id ? value._id : value;
    return !!current && !!id && String(current) === String(id);
  }
}
