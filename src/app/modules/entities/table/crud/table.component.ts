import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Room, Table, TableState } from '@types';
import { RoomService } from 'app/core/services/room.service';
import { TableService } from 'app/core/services/table.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    TypeaheadDropdownComponent,
  ],
})
export class TableComponent implements OnInit {
  public operation: string;
  public table: Table;
  public rooms: Room[] = new Array();
  public tableForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  private destroy$ = new Subject<void>();
  public states: TableState[] = [TableState.Available, TableState.Disabled, TableState.Reserved];

  constructor(
    private _tableService: TableService,
    private _roomService: RoomService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.tableForm = this._fb.group({
      _id: ['', []],
      description: ['', [Validators.required, Validators.maxLength(5)]],
      room: ['', [Validators.required]],
      chair: ['', [Validators.required]],
      state: [TableState.Available, []],
    });
  }

  async ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const tableId = pathUrl[4];
    this.operation = pathUrl[3];
    if (this.operation === 'view' || this.operation === 'delete') this.tableForm.disable();

    this.getRooms();

    if (tableId) {
      this.getTable(tableId);
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

  public getRooms(): Promise<void> {
    this.loading = true;

    return new Promise(() => {
      this._roomService
        .find({ query: { operationType: { $ne: 'D' } } })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.rooms = result;
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
            this.setValueForm();
          },
        });
    });
  }

  returnTo() {
    return this._router.navigate(['/entities/tables']);
  }

  public getTable(tableId: string) {
    this.loading = true;

    this._tableService
      .getById(tableId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.table = result.result;
          this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public setValueForm() {
    const room = this.rooms?.find((item) => item._id == this.table?.room?.toString());

    this.tableForm.setValue({
      _id: this.table?._id ?? '',
      description: this.table?.description ?? '',
      room: room ?? null,
      chair: this.table?.chair ?? 0,
      state: this.table?.state ?? TableState.Available,
    });
  }

  onEnter() {
    const isInQuill = event.target instanceof HTMLDivElement && event.target.classList.contains('ql-editor');

    if (isInQuill) {
      event.preventDefault();
      return;
    }

    if (this.tableForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.addTable();
    }
  }
  public addTable(): void {
    this.loading = true;
    this.tableForm.markAllAsTouched();
    if (this.tableForm.invalid) {
      this.loading = false;
      return;
    }
    this.table = this.tableForm.value;

    switch (this.operation) {
      case 'add':
        this.saveTable();
        break;
      case 'update':
        this.updateTable();
        break;
      case 'delete':
        this.deleteTable();
      default:
        break;
    }
  }

  public updateTable() {
    this.loading = true;

    this._tableService
      .update(this.table)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this._toastService.showToast(result);
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
          this.returnTo();
        },
      });
  }

  public saveTable(): void {
    this.loading = true;
    this._tableService
      .save(this.table)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this._toastService.showToast(result);
          this.table = result.result;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
          this.returnTo();
        },
      });
  }

  public deleteTable() {
    this.loading = true;

    this._tableService.delete(this.table._id).subscribe({
      next: (result) => {
        this._toastService.showToast(result);
      },
      error: (error) => {
        this._toastService.showToast(error);
      },
      complete: () => {
        this.loading = false;
        this.returnTo();
      },
    });
  }
}
