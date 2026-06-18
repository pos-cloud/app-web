import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Transaction } from 'app/components/transaction/transaction';
import { TransactionService } from 'app/core/services/transaction.service';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';

/**
 * Vista única de cobro (placeholder inicial). La idea es que acá viva TODO el flujo de
 * cobro (medios de pago + facturación electrónica + impresión), y que tanto el botón
 * "Cobrar" de los listados como el alta y el editor naveguen a esta ruta.
 */
@Component({
  selector: 'app-charge',
  templateUrl: './charge.component.html',
  styleUrls: ['./charge.component.scss'],
  standalone: true,
  providers: [TranslateService],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, NgbModule, TranslateModule, ProgressbarModule],
})
export class ChargeComponent implements OnInit {
  public loading = false;
  public transaction: Transaction;
  public returnURL: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _transactionService: TransactionService,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.returnURL = this._route.snapshot.queryParams['returnURL'] ?? '/';
    const id = this._route.snapshot.params['id'];
    if (id) {
      this.loadTransaction(id);
    }
  }

  private loadTransaction(id: string): void {
    this.loading = true;
    this._transactionService.getTransaction(id).subscribe(
      (result) => {
        this.loading = false;
        if (result?.transaction) {
          this.transaction = result.transaction;
        } else {
          this._toastService.showToast(result);
        }
      },
      (error) => {
        this.loading = false;
        this._toastService.showToast(error);
      }
    );
  }

  public back(): void {
    this._router.navigateByUrl(this.returnURL);
  }
}
