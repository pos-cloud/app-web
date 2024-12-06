import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { Room } from '@types';

import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RoomService } from '../../../core/services/room.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
})
export class RoomComponent implements OnInit {
  public roomId: string;
  public operation: string;
  public readonly: boolean;
  public room: Room;
  public roomForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  private destroy$ = new Subject<void>();

  constructor(
    public _roomService: RoomService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    let pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    this.roomId = pathUrl[4];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.readonly = true;

    if (this.roomId) {
      this.getRoom();
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
    this.roomForm = this._fb.group({
      _id: ['', []],
      description: ['', [Validators.required]],
    });
  }

  public setValueForm(): void {
    this.roomForm.setValue({
      _id: this.room._id ?? '',
      description: this.room.description ?? '',
    });
  }

  returnTo() {
    return this._router.navigate(['/entities/rooms']);
  }

  public addRoom(): void {
    this.loading = true;
    this.room = this.roomForm.value;

    switch (this.operation) {
      case 'add':
        this.saveRoom();
        break;
      case 'update':
        this.updateRoom();
        break;
      case 'delete':
        this.deleteRoom();
      default:
        break;
    }
  }

  public getRoom(): void {
    this._roomService
      .getById(this.roomId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.room = result.result;
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

  public updateRoom(): void {
    this._roomService
      .update(this.room)
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

  public saveRoom(): void {
    this.loading = true;
    this._roomService
      .save(this.room)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this._toastService.showToast(result);
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.buildForm();
          this.returnTo();
        },
      });
  }

  public deleteRoom(): void {
    this.loading = true;

    this._roomService
      .delete(this.room._id)
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
}
