import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { Room, Table, TableState } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { RoomService } from '../../../core/services/room.service';
import { TableService } from '../../../core/services/table.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
})
export class TableComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public table: Table;
  public rooms: Room[] = new Array();
  public tableForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  private destroy$ = new Subject<void>();
  public states: TableState[] = [
    TableState.Available,
    TableState.Disabled,
    TableState.Reserved,
  ];

  constructor(
    public _tableService: TableService,
    public _roomService: RoomService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
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
    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.readonly = true;

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
  }

  public getRooms(): Promise<void> {
    this.loading = true;

    return new Promise((resolve, reject) => {
      this._roomService
        .getAll({})
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.rooms = result.result;
            resolve();
          },
          error: (error) => {
            this._toastService.showToast(error);
            reject();
          },
          complete: () => {
            this.loading = false;
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
    const room = this.rooms?.find(
      (item) => item._id == this.table.room.toString()
    );

    this.tableForm.setValue({
      _id: this.table._id ?? '',
      description: this.table.description ?? '',
      room: room ?? null,
      chair: this.table.chair ?? 0,
      state: this.table.state ?? TableState.Available,
    });
  }

  public addTable(): void {
    this.tableForm.markAllAsTouched();
    if (this.tableForm.invalid) {
      this._toastService.showToast({
        message: 'Por favor complete todos los campos obligatorios.',
      });
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
