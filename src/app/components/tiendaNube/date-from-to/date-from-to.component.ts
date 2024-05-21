import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionService } from '../../transaction/transaction.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from '../../../main/pipes/translate-me';

@Component({
  selector: 'app-date-from-to',
  templateUrl: './date-from-to.component.html',
  styleUrls: ['./date-from-to.component.css'],
  providers: [TranslateMePipe],
})
export class DateFromToComponent {
  loading= false
  syncForm: FormGroup;
  
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
      this.syncForm = this.fb.group({
        desde: [''],
        hasta: [''],
      });
    }
    
    syncTiendaNube(){
      this.loading = true;
      const formData = this.syncForm.value;
      this._transactionService.syncTiendaNube(formData).subscribe(
          result => {
              this.loading = false;
              this.showToast(result,'success', null, result.result)
              this.activeModal.close();
          }, error => {
              this.loading = false;
              this.showToast(error)
              this.activeModal.close();
          }
      )
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
