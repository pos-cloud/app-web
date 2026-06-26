import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Notification } from '@types';
import { PipesModule } from '@shared/pipes/pipes.module';

@Component({
  selector: 'app-view-notification',
  templateUrl: './view-notification.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule, PipesModule],
})
export class ViewNotificationComponent {
  @Input() notification: Notification & { link?: string };

  constructor(public activeModal: NgbActiveModal) {}

  public get link(): string | null {
    const url = this.notification?.link ?? (this.notification?.payload?.['url'] as string | undefined);
    return typeof url === 'string' && url.trim() ? url.trim() : null;
  }

  public get hasPayload(): boolean {
    const payload = this.notification?.payload;
    return !!payload && Object.keys(payload).length > 0;
  }

  public openLink(): void {
    if (this.link) {
      window.open(this.link, '_blank', 'noopener,noreferrer');
    }
  }
}
