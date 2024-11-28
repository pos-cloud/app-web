import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { ToastrService } from 'ngx-toastr';
import { TransactionService } from '../../../../core/services/transaction.service';

@Component({
  selector: 'app-date-from-to',
  templateUrl: './date-from-to.component.html',
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
export class DateFromToComponent {
  loading = false;
  syncForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _transactionService: TransactionService,
    public activeModal: NgbActiveModal,
    private _toastr: ToastrService
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
        // this.showToast(result, 'success', null, result.result);
        this.activeModal.close();
      },
      (error) => {
        this.loading = false;
        //   this.showToast(error);
        this.activeModal.close();
      }
    );
  }
}
