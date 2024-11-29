import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/shared/pipes/pipes.module';

import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponse } from '@types';
import { TiendaNubeService } from 'app/core/services/tienda-nube.service';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Config } from '../../../../app.config';
import { Transaction } from '../../../../components/transaction/transaction';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  standalone: true,
  imports: [
    CommonModule,
    PipesModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressbarModule,
  ],
})
export class CancelComponent implements OnInit {
  @Input() transaction: Transaction;
  @Input() config: Config;
  @Input() state: string;
  cancelForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private _tiendaNubeService: TiendaNubeService,
    public activeModal: NgbActiveModal,
    private _toastService: ToastService
  ) {}

  async ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.cancelForm = this.fb.group({
      reason: ['El cliente cambió de idea'],
      email: [true],
      restock: [true],
      storeIdTn: [this.config.tiendaNube.userID],
    });
  }

  changeStatusTiendaNube() {
    if (this.cancelForm.valid) {
      const formData = this.cancelForm.value;
      let reasonMappings: any = {
        'Otro motivo': 'other',
        'El cliente cambió de idea': 'customer',
        'El producto no esta disponible': 'inventory',
        'Es fraudulenta': 'fraud',
      };
      formData.reason = reasonMappings[formData.reason];
      return new Promise<Transaction>((resolve, reject) => {
        this._tiendaNubeService
          .updateTransactionStatus(
            this.transaction.tiendaNubeId,
            formData,
            this.state
          )
          .subscribe(
            (result: ApiResponse) => {
              if (result.status === 200) {
                resolve(result.result);
                this.activeModal.close();
              } else {
                this._toastService.showToast(result);
                reject(result);
                this.activeModal.close();
              }
            },
            (error) => {
              this._toastService.showToast(error);
              reject(error);
              this.activeModal.close();
            }
          );
      });
    }
  }
}
