import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationsService } from '@core/services/notifications.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Notification } from '@types';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, RouterLink],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  public notifications: Notification[] = [];
  public unreadCount = 0;
  public loading = false;

  private destroy$ = new Subject<void>();

  constructor(private _notificationsService: NotificationsService) {}

  ngOnInit(): void {
    this.loadUnreadCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onDropdownOpen(isOpen: boolean): void {
    if (isOpen) {
      this.loadNotifications();
    }
  }

  public markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();

    this.openLink(notification);

    this._notificationsService
      .markAsRead(notification._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refresh());
  }

  public getLink(notification: Notification): string | null {
    const url = notification?.payload?.['url'];
    return typeof url === 'string' && url.trim() ? url.trim() : null;
  }

  private openLink(notification: Notification): void {
    const url = this.getLink(notification);
    if (!url) return;

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  public markAllAsRead(): void {
    this._notificationsService
      .markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refresh());
  }

  public trackById(_index: number, notification: Notification): string {
    return notification._id;
  }

  private refresh(): void {
    this.loadUnreadCount();
    if (this.notifications.length) {
      this.loadNotifications();
    }
  }

  private loadUnreadCount(): void {
    this._notificationsService
      .getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.unreadCount = count;
      });
  }

  private loadNotifications(): void {
    this.loading = true;
    this._notificationsService
      .getMine()
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        this.notifications = notifications ?? [];
        this.loading = false;
        this.loadUnreadCount();
      });
  }
}
