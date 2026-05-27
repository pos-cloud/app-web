import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MovementOfArticleService } from 'app/core/services/movement-of-article.service';
import { ToastService } from 'app/shared/components/toast/toast.service';

export interface PosCreateLinePayload {
  transactionId: string;
  articleId: string;
  quantity: number;
  salePrice?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PosLineService {
  constructor(
    private readonly _movementOfArticleService: MovementOfArticleService,
    private readonly _toastService: ToastService
  ) {}

  createLine(payload: PosCreateLinePayload): Observable<unknown> {
    const body = {
      transactionId: payload.transactionId,
      articleId: payload.articleId,
      quantity: payload.quantity > 0 ? payload.quantity : 1,
      salePrice: payload.salePrice ?? 0,
      recalculateParent: false,
    };

    return this._movementOfArticleService.createMovementOfArticle(body).pipe(
      map((res: any) => {
        const status = res?.status ?? 200;
        if (status >= 400) {
          const message = res?.message || res?.error?.message || 'No se pudo agregar el producto';
          throw new Error(message);
        }
        if (!res?.result && res?.message) {
          throw new Error(res.message);
        }
        return res?.result ?? res;
      })
    );
  }

  createLineWithFeedback(payload: PosCreateLinePayload): Observable<boolean> {
    return new Observable((subscriber) => {
      this.createLine(payload).subscribe({
        next: () => {
          this._toastService.showToast({
            type: 'success',
            message: 'Producto agregado',
          });
          subscriber.next(true);
          subscriber.complete();
        },
        error: (err: Error) => {
          this._toastService.showToast({
            type: 'danger',
            message: err?.message || 'No se pudo agregar el producto',
          });
          subscriber.next(false);
          subscriber.complete();
        },
      });
    });
  }
}
