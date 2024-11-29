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
import { TiendaNubeService } from 'app/core/services/tienda-nube.service';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';

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
    private _tiendaNubeService: TiendaNubeService,
    public activeModal: NgbActiveModal,
    private _toastService: ToastService
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
    this._tiendaNubeService.syncTiendaNube(formData).subscribe(
      (result) => {
        this.loading = false;
        this._toastService.showToast(result);
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
