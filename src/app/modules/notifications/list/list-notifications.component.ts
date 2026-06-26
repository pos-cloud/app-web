import { Component, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsService } from '@core/services/notifications.service';
import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { ViewNotificationComponent } from '../components/view-notification/view-notification.component';

@Component({
  selector: 'app-list-notifications',
  templateUrl: './list-notifications.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListNotificationsComponent {
  public title = 'notifications';
  public sort = { creationDate: -1 };
  public exportPermision = false;

  public columns: IAttribute[] = [
    {
      name: 'title',
      visible: true,
      disabled: false,
      filter: true,
      defaultFilter: null,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'message',
      visible: true,
      disabled: false,
      filter: true,
      defaultFilter: null,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'type',
      visible: true,
      disabled: false,
      filter: true,
      defaultFilter: null,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'creationDate',
      visible: true,
      disabled: false,
      filter: true,
      defaultFilter: null,
      datatype: 'date',
      project: `{ "$dateToString": { "date": "$creationDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
      align: 'left',
      required: false,
    },
    {
      name: '_id',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$toString": "$_id" }`,
      align: 'left',
      required: false,
    },
    {
      name: 'link',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      project: `{ "$ifNull": ["$payload.url", ""] }`,
      align: 'left',
      required: true,
    },
    {
      name: 'payload',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      project: `"$payload"`,
      align: 'left',
      required: true,
    },
    {
      name: 'operationType',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      defaultFilter: `{ "$ne": "D" }`,
      project: null,
      align: 'left',
      required: true,
    },
  ];

  public rowButtons: IButton[] = [
    {
      title: 'view',
      icon: 'fa fa-eye',
      class: 'btn btn-success btn-sm',
      click: `this.emitEvent('view', item)`,
    },
    {
      title: 'Abrir link',
      icon: 'fa fa-external-link',
      class: 'btn btn-light btn-sm',
      click: `if (item.link) { window.open(item.link, '_blank', 'noopener,noreferrer'); }`,
    },
  ];

  public headerButtons: IButton[] = [
    {
      title: 'refresh',
      icon: 'fa fa-refresh',
      class: 'btn btn-light',
      click: `this.refresh()`,
    },
  ];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: NotificationsService,
    private _modalService: NgbModal
  ) {}

  public emitEvent(event: { op: string; obj: any }): void {
    if (event.op === 'view' || event.op === 'on-click') {
      this.openView(event.obj);
    }
  }

  private openView(notification: any): void {
    if (!notification) return;

    const modalRef = this._modalService.open(ViewNotificationComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.notification = notification;
  }

  public refresh(): void {
    this.datatableComponent.refresh();
  }
}
