import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ClockService } from '@core/services/clock.service';
import { RoomService } from '@core/services/room.service';
import { TableService } from '@core/services/table.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '@shared/components/toast/toast.service';
import { ApiResponse, Room, Table, TableState } from '@types';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { CloseTableModalComponent } from './components/close-table-modal/close-table-modal.component';

type TableVisualState = 'available' | 'busy' | 'pending-payment' | 'pending' | 'reserved' | 'disabled';

@Component({
  selector: 'app-resto-tables',
  standalone: true,
  imports: [CommonModule, NgbModule, CloseTableModalComponent],
  templateUrl: './resto-tables.component.html',
  styleUrls: ['./resto-tables.component.scss'],
})
export class RestoTablesComponent implements OnInit, OnDestroy {
  @Input() loading = false;
  @Output() eventTableSelected = new EventEmitter<Table>();

  public rooms: Room[] = [];
  public roomSelected: Room | null = null;
  public tables: Table[] = [];
  public areTablesEmpty = true;
  public now = moment().format('YYYY-MM-DDTHH:mm:ssZ');

  private tableToClose: Table | null = null;
  private refreshInterval?: ReturnType<typeof setInterval>;
  private pendingRoomId?: string;
  private destroy$ = new Subject<void>();

  constructor(
    private _tableService: TableService,
    private _roomService: RoomService,
    private _router: Router,
    private _clockService: ClockService,
    private _modalService: NgbModal,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.syncRoomFromUrl();
    this.getRooms();
    this.refreshInterval = setInterval(() => {
      if (!this.loading) {
        this.getTables();
      }
    }, 20000);
    this._clockService
      .getClock()
      .pipe(takeUntil(this.destroy$))
      .subscribe((time) => {
        this.now = time;
      });
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  public get filteredTables(): Table[] {
    if (!this.roomSelected) {
      return this.tables;
    }
    return this.tables.filter((table) => this.belongsToSelectedRoom(table));
  }

  public get amountOfDiners(): number {
    return this.filteredTables.reduce((sum, table) => sum + (table.chair || 0), 0);
  }

  public get amountOfDinersNow(): number {
    return this.filteredTables.reduce((sum, table) => {
      if (table.state === TableState.Busy || table.state === TableState.Pending) {
        return sum + (table.diners || 0);
      }
      return sum;
    }, 0);
  }

  public changeRoom(room: Room): void {
    this.roomSelected = room;
    this.getTables();
  }

  public isRoomSelected(room: Room): boolean {
    return this.normalizeId(room._id) === this.normalizeId(this.roomSelected?._id);
  }

  public async selectTable(table: Table): Promise<void> {
    this.loading = true;
    try {
      table = await this.getTable(table._id);
      if (table.state === TableState.Pending) {
        this.openCloseTableModal(table);
      } else {
        this.eventTableSelected.emit(table);
      }
    } catch (error) {
      this._toastService.showToast(error);
      this.loading = false;
    }
  }

  public getVisualState(table: Table): TableVisualState {
    if (table.state === TableState.Disabled) {
      return 'disabled';
    }
    if (table.state === TableState.Pending) {
      return 'pending';
    }
    if (this.isPendingPayment(table)) {
      return 'pending-payment';
    }
    if (table.state === TableState.Busy) {
      return 'busy';
    }
    if (table.state === TableState.Reserved) {
      return 'reserved';
    }
    return 'available';
  }

  public getStatusLabel(table: Table): string {
    const state = this.getVisualState(table);
    switch (state) {
      case 'available':
        return 'Disponible';
      case 'busy':
        return 'Ocupada';
      case 'pending-payment':
        return 'Pendiente de pago';
      case 'pending':
        return 'Pendiente';
      case 'reserved':
        return 'Reservada';
      case 'disabled':
        return 'No habilitada';
    }
  }

  public showDiners(table: Table): boolean {
    return table.state === TableState.Busy || table.state === TableState.Reserved || table.state === TableState.Pending;
  }

  public showEmployee(table: Table): boolean {
    return (
      !!table.employee &&
      table.state !== TableState.Available &&
      table.state !== TableState.Reserved &&
      table.state !== TableState.Disabled
    );
  }

  public showElapsedTime(table: Table): boolean {
    return !!table.lastTransaction && (table.state === TableState.Busy || table.state === TableState.Pending);
  }

  public getElapsedTime(startDate: string): string {
    if (!startDate) {
      return '--:--';
    }
    const secs = moment(this.now).diff(startDate, 'seconds');
    return moment.utc(secs * 1000).format('HH:mm');
  }

  private getRooms(): void {
    this._roomService
      .getAll({
        project: { description: 1, operationType: 1 },
        match: { operationType: { $ne: 'D' } },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          if (result.status === 200) {
            this.rooms = result.result || [];
            this.selectInitialRoom();
            return;
          }

          this.rooms = [];
          this.roomSelected = null;
          this._toastService.showToast(result);
        },
        error: (error) => this._toastService.showToast(error),
      });
  }

  private selectInitialRoom(): void {
    if (!this.rooms.length) {
      this.roomSelected = null;
      return;
    }

    if (this.pendingRoomId) {
      const roomFromUrl = this.rooms.find((room) => this.normalizeId(room._id) === this.pendingRoomId);
      if (roomFromUrl) {
        this.roomSelected = roomFromUrl;
        this.getTables();
        return;
      }
    }

    if (this.roomSelected?._id) {
      const selectedRoomId = this.normalizeId(this.roomSelected._id);
      const currentRoom = this.rooms.find((room) => this.normalizeId(room._id) === selectedRoomId);
      if (currentRoom) {
        this.roomSelected = currentRoom;
        this.getTables();
        return;
      }
    }

    this.roomSelected = this.rooms[0];
    this.getTables();
  }

  public getTables(): void {
    this._tableService
      .getAll({
        project: {
          description: 1,
          'room._id': 1,
          'room.description': 1,
          chair: 1,
          diners: 1,
          state: 1,
          'employee._id': 1,
          'employee.name': 1,
          'employee.type._id': 1,
          'employee.type.description': 1,
          'lastTransaction._id': 1,
          'lastTransaction.startDate': 1,
          'lastTransaction.state': 1,
          operationType: 1,
        },
        match: { operationType: { $ne: 'D' } },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          if (result.status === 200) {
            this.tables = this.naturalSort(result.result || []);
            this.areTablesEmpty = this.filteredTables.length === 0;
            return;
          }

          this.tables = [];
          this.areTablesEmpty = true;
          if (result.status === 0) {
            this._toastService.showToast(
              null,
              'danger',
              '',
              'Error al conectar con el servidor. Corroborar que este encendido.'
            );
            return;
          }
          this._toastService.showToast(result);
        },
        error: (error) => this._toastService.showToast(error),
      });
  }

  private getTable(tableId: string): Promise<Table> {
    return new Promise<Table>((resolve, reject) => {
      this._tableService
        .getById(tableId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: ApiResponse) => {
            if (result.status === 200) {
              resolve(result.result);
              return;
            }
            reject(result);
          },
          error: (error) => reject(error),
        });
    });
  }

  private openCloseTableModal(table: Table): void {
    const modalRef = this._modalService.open(CloseTableModalComponent, {
      backdrop: 'static',
    });
    modalRef.componentInstance.table = table;

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.tableToClose = table;
          this.tableToClose.state = TableState.Available;
          this.tableToClose.lastTransaction = null;
          this.updateTable();
        } else {
          this.loading = false;
        }
      },
      () => {
        this.loading = false;
      }
    );
  }

  private updateTable(): void {
    if (!this.tableToClose) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this._tableService
      .update(this.tableToClose)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          this.loading = false;
          if (result.status === 200) {
            this.getTables();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }

  private syncRoomFromUrl(): void {
    const segments = this._router.url.split('/');
    const salonesIndex = segments.indexOf('salones');
    if (salonesIndex >= 0 && segments[salonesIndex + 1]) {
      this.pendingRoomId = segments[salonesIndex + 1];
    }
  }

  private belongsToSelectedRoom(table: Table): boolean {
    if (!this.roomSelected) {
      return true;
    }

    const selectedId = this.normalizeId(this.roomSelected._id);
    const tableRoomId = this.normalizeId(table.room?._id);
    if (selectedId && tableRoomId && selectedId === tableRoomId) {
      return true;
    }

    const selectedDesc = this.roomSelected.description?.toLowerCase().trim() ?? '';
    const tableRoomDesc = table.room?.description?.toLowerCase().trim() ?? '';
    if (!selectedDesc || !tableRoomDesc) {
      return false;
    }

    return tableRoomDesc.includes(selectedDesc);
  }

  private isPendingPayment(table: Table): boolean {
    return table.lastTransaction?.state?.toString() === 'Pendiente de pago';
  }

  private naturalSort(tables: Table[]): Table[] {
    return [...tables].sort((a, b) => this.naturalCompare(a.description, b.description));
  }

  private naturalCompare(a: string, b: string): number {
    const chunksA = a.match(/(\d+|\D+)/g) || [];
    const chunksB = b.match(/(\d+|\D+)/g) || [];

    for (let i = 0; i < Math.min(chunksA.length, chunksB.length); i++) {
      const chunkA = chunksA[i];
      const chunkB = chunksB[i];

      if (!isNaN(Number(chunkA)) && !isNaN(Number(chunkB))) {
        const diff = Number(chunkA) - Number(chunkB);
        if (diff !== 0) {
          return diff;
        }
      } else {
        const diff = chunkA.localeCompare(chunkB);
        if (diff !== 0) {
          return diff;
        }
      }
    }

    return chunksA.length - chunksB.length;
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
