import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { AuthService } from 'app/core/services/auth.service';
import { environment } from 'environments/environment';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RealtimeService implements OnDestroy {
  private eventSource?: EventSource;
  private notificationRefresh$ = new Subject<void>();
  private tablesRefresh$ = new Subject<Record<string, unknown>>();

  constructor(
    private _authService: AuthService,
    private _ngZone: NgZone
  ) {}

  ngOnDestroy(): void {
    this.disconnect();
  }

  public connect(): void {
    const token = this._authService.getToken();
    if (!token || this.eventSource) {
      return;
    }

    const url = `${environment.apiv2}/realtime/stream?token=${encodeURIComponent(token)}`;
    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('notification:refresh', () => {
      this._ngZone.run(() => this.notificationRefresh$.next());
    });

    this.eventSource.addEventListener('tables:refresh', (event: MessageEvent) => {
      this._ngZone.run(() => {
        try {
          const data = event.data ? JSON.parse(event.data) : {};
          this.tablesRefresh$.next(data);
        } catch {
          this.tablesRefresh$.next({});
        }
      });
    });
  }

  public disconnect(clearSubjects = true): void {
    this.eventSource?.close();
    this.eventSource = undefined;

    if (clearSubjects) {
      this.notificationRefresh$.complete();
      this.tablesRefresh$.complete();
    }
  }

  public onNotificationRefresh(): Observable<void> {
    return this.notificationRefresh$.asObservable();
  }

  public onTablesRefresh(): Observable<Record<string, unknown>> {
    return this.tablesRefresh$.asObservable();
  }
}
