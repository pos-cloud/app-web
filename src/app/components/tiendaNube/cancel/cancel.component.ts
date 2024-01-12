import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { TransactionService } from '../../transaction/transaction.service';
import { Transaction } from '../../transaction/transaction';
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from '../../../main/pipes/translate-me';
import Resulteable from '../../../util/Resulteable';
import { Config } from '../../../app.config';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css'],
  providers: [NgbAlertConfig, TranslateMePipe],
})
export class CancelComponent implements OnInit {
  @Input() transaction: Transaction;
  @Input() config: Config;
  @Input() state: string;
  cancelForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private _transactionService: TransactionService,
    public activeModal: NgbActiveModal,
    private _toastr: ToastrService,
    public translatePipe: TranslateMePipe,
    ) {}

  async ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.cancelForm = this.fb.group({
      reason: ['Otro'],
      email: [true],
      restock: [true],
      storeIdTn: [this.config.tiendaNube.userID]
    });
  }

  changeStatusTiendaNube(){
    if (this.cancelForm.valid) {
      const formData = this.cancelForm.value;
      let reasonMappings: any = {
        'Otro': 'other',
        'Cliente': 'customer',
        'Inventario': 'inventory' ,
        'Fraude' : 'fraud'
    };
      formData.reason = reasonMappings[formData.reason];
      return new Promise<Transaction>((resolve, reject) => {
        this._transactionService.updateTransactionStatus(this.transaction.tiendaNubeId, formData, this.state).subscribe(
            (result: Resulteable) => {
                if (result.status === 200) {
                    resolve(result.result);
                    this.activeModal.close();
                } else {
                    this.showToast(result);
                    reject(result);
                    this.activeModal.close();
                };
            },
            error => {
                this.showToast(error)
                reject(error);
                this.activeModal.close();
            }
        );
    });
    }
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
        if (result.status === 0) {
            type = 'info';
            title = 'el servicio se encuentra en mantenimiento, inténtelo nuevamente en unos minutos';
        } else if (result.status === 200) {
            type = 'success';
            title = result.message;
        } else if (result.status >= 500) {
            type = 'danger';
            title = (result.error && result.error.message) ? result.error.message : result.message;
        } else {
            type = 'info';
            title = (result.error && result.error.message) ? result.error.message : result.message;
        }
    }
    switch (type) {
        case 'success':
            this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
            break;
        case 'danger':
            this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
            break;
        default:
            this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
            break;
    }
    this.loading = false;
}

}
