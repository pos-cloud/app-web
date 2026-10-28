import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, Structure, Utilization } from '@types';

import { CommonModule } from '@angular/common';
import { ArticleService } from '@core/services/article.service';
import { StructureService } from '@core/services/structure.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { SearchableDropdownComponent } from '@shared/components/searchable-dropdown/searchable-dropdown.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-structure',
  templateUrl: './structure.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PipesModule,
    TranslateModule,
    SearchableDropdownComponent,
    ProgressbarModule,
  ],
})
export class StructureComponent implements OnInit {
  public operation: string;
  public structure: Structure;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public structureForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();
  public utilization = Utilization;

  constructor(
    public _structureService: StructureService,
    public _articleService: ArticleService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.structureForm = this._fb.group({
      _id: ['', []],
      parent: ['', [Validators.required]],
      child: ['', [Validators.required]],
      quantity: [0, [Validators.required]],
      utilization: ['', [Validators.required]],
      optional: [false, []],
      increasePrice: [0, []],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');

    const structureId = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.structureForm.disable();

    if (structureId) {
      this.getStructure(structureId);
    } else {
      this.setValueForm();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  public setValueForm(): void {
    const values = {
      _id: this.structure?._id ?? '',
      parent: this.structure?.parent ?? null,
      child: this.structure?.child ?? null,
      quantity: this.structure?.quantity ?? 0,
      utilization: this.structure?.utilization ?? this.utilization.Sale,
      optional: this.structure?.optional ?? false,
      increasePrice: this.structure?.increasePrice ?? 0,
    };
    this.structureForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/structures']);
  }

  onEnter() {
    if (this.structureForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.handleStructureOperation();
    }
  }

  public getStructure(id: string) {
    this.loading = true;

    this._structureService
      .getStructureObjById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.structure = result.result;
          if (result.status == 200) this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public handleStructureOperation() {
    this.loading = true;
    this.structureForm.markAllAsTouched();
    if (this.structureForm.invalid) {
      this.loading = false;
      return;
    }

    this.structure = this.structureForm.value;

    switch (this.operation) {
      case 'add':
        this.saveStructure();
        break;
      case 'update':
        this.updateStructure();
        break;
      case 'delete':
        this.deleteStructure();
      default:
        break;
    }
  }

  public updateStructure() {
    this._structureService
      .update(this.structure)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public saveStructure() {
    this._structureService
      .save(this.structure)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public deleteStructure() {
    this._structureService
      .delete(this.structure._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
