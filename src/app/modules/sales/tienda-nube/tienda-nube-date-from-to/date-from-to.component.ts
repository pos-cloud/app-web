import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TiendaNubeService } from 'app/core/services/tienda-nube.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-date-from-to',
  templateUrl: './date-from-to.component.html',
  standalone: true,
  imports: [CommonModule, PipesModule, ReactiveFormsModule],
})
export class DateFromToComponent {
  loading = false;
  syncForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private _tiendaNubeService: TiendaNubeService,
    public activeModal: NgbActiveModal,
    private _toastService: ToastService
  ) {}

  async ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this._tiendaNubeService
      .syncTiendaNube(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this._toastService.showToast({
            message: 'Operacion realizada con exito',
          });
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
          this.activeModal.close();
        },
      });
  }
}
