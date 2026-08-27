import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { RoomService } from '@core/services/room.service';
import { TableService } from '@core/services/table.service';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '@shared/components/toast/toast.service';
import { Room, Table, TableState } from '@types';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-select-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule],
  templateUrl: './select-table.component.html',
})
export class SelectTableComponent implements OnInit, OnDestroy {
  @Input() roomId?: string | Room;

  public tableForm!: UntypedFormGroup;
  public rooms: Room[] = [];
  public tables: Table[] = [];
  public loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    public _fb: UntypedFormBuilder,
    private _roomService: RoomService,
    private _tableService: TableService,
    private _toastService: ToastService,
    public activeModal: NgbActiveModal
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.getRooms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public buildForm(): void {
    this.tableForm = this._fb.group({
      room: [, []],
      table: [, []],
    });
  }

  public onRoomChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.tableForm.patchValue({ table: null });
    this.getTables(select.value);
  }

  public selectTable(): void {
    if (!this.tableForm.value.table) {
      this._toastService.showToast({
        type: 'info',
        message: 'Debe seleccionar una mesa.',
      });
      return;
    }

    this.activeModal.close({ table: this.tableForm.value.table });
  }

  private getRooms(): void {
    this.loading = true;
    this._roomService
      .find({
        project: { description: 1 },
        query: { operationType: { $ne: 'D' } },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result?.length) {
            this.rooms = result;
            this.selectInitialRoom();
          } else {
            this.rooms = [];
            this._toastService.showToast({
              type: 'info',
              message: 'No se encontraron salones.',
            });
            this.loading = false;
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }

  private selectInitialRoom(): void {
    const currentRoomId = this.normalizeId(this.roomId);
    const roomFromInput = currentRoomId
      ? this.rooms.find((room) => this.normalizeId(room._id) === currentRoomId)
      : null;
    const room = roomFromInput || this.rooms[0];

    this.tableForm.patchValue({ room: room._id });
    this.getTables(room._id);
  }

  private getTables(roomId: string): void {
    const normalizedRoomId = this.normalizeId(roomId);
    if (!normalizedRoomId) {
      this.tables = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    this._tableService
      .find({
        project: {
          description: 1,
          room: 1,
          chair: 1,
          diners: 1,
          state: 1,
          employee: 1,
          lastTransaction: 1,
        },
        query: {
          operationType: { $ne: 'D' },
          room: normalizedRoomId,
          state: TableState.Available,
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result?.length) {
            this.tables = [...result].sort((a, b) =>
              (a.description || '').localeCompare(b.description || '', undefined, { numeric: true })
            );
          } else {
            this.tables = [];
            this._toastService.showToast({
              type: 'info',
              message: 'No se encontraron mesas disponibles.',
            });
          }
          this.loading = false;
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }

  private normalizeId(id: unknown): string {
    if (id == null) {
      return '';
    }
    if (typeof id === 'string') {
      return id;
    }
    if (typeof id === 'object') {
      const record = id as { $oid?: string; _id?: unknown; toString?: () => string };
      if (record.$oid) {
        return record.$oid;
      }
      if (record._id != null) {
        return this.normalizeId(record._id);
      }
      if (typeof record.toString === 'function') {
        return record.toString();
      }
    }
    return String(id);
  }
}
