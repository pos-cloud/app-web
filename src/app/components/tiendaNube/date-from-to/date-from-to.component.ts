import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { TranslateMePipe } from '../../../shared/pipes/translate-me';

@Component({
  selector: 'app-date-from-to',
  templateUrl: './date-from-to.component.html',
  styleUrls: ['./date-from-to.component.css'],
  providers: [TranslateMePipe],
})
export class DateFromToComponent {
  loading = false;
  syncForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _toastService: ToastService,
    private _transactionService: TransactionService,
    public activeModal: NgbActiveModal,
    public translatePipe: TranslateMePipe
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

  syncTiendaNube() {
    this.loading = true;
    const formData = this.syncForm.value;
    this._transactionService.syncTiendaNube(formData).subscribe(
      (result) => {
        this.loading = false;
        this._toastService.showToast(result, 'success', null, result.result);
        this.activeModal.close();
      },
      (error) => {
        this.loading = false;
        this._toastService.showToast(error);
        this.activeModal.close();
      }
    );
  }
}
