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
  public tableId: string;
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
    this.getRooms();
  }

  ngOnInit(): void {
    let pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    this.tableId = pathUrl[4];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.readonly = true;

    if (this.tableId) {
      this.getTable();
    }
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public buildForm(): void {
    this.tableForm = this._fb.group({
      _id: ['', []],
      description: ['', [Validators.required, Validators.maxLength(5)]],
      room: [null, [Validators.required]],
      chair: [0, [Validators.required]],
      state: [TableState.Available, []],
    });
  }

  public getRooms(): void {
    this.loading = true;

    this._roomService
      .getAll({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.rooms = result.result;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  returnTo() {
    return this._router.navigate(['/entities/tables']);
  }

  public getTable() {
    this.loading = true;

    this._tableService
      .getById(this.tableId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.table = result.result;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
          this.setValueForm();
        },
      });
  }

  public setValueForm() {
    let room;
    if (!this.table.room) {
      room = null;
    } else {
      if (this.table.room._id) {
        room = this.table.room._id;
      } else {
        room = this.table.room;
      }
    }

    this.tableForm.setValue({
      _id: this.table._id ?? '',
      description: this.table.description ?? '',
      room: room,
      chair: this.table.chair ?? 0,
      state: this.table.state ?? TableState.Available,
    });
  }

  public addTable(): void {
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

    this.table = this.tableForm.value;

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
        },
      });
  }

  public saveTable(): void {
    this.loading = true;
    this.table = this.tableForm.value;

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
          this.buildForm();
          this.getRooms();
          this.loading = false;
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
      },
    });
  }
}
