import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListUserComponent implements OnInit, OnDestroy {
  public title = 'Usuarios sistema';
  public profileSlug: 'system' | 'external' = 'system';
  public profile: 'Interno' | 'Externo' = 'Interno';
  private destroy$ = new Subject<void>();
  public sort = { name: 1 };
  public columns = [
    {
      name: 'name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },

    {
      name: 'email',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'state',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'phone',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'tokenExpiration',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'token',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'employee.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'cashBoxType.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'origin.number',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      align: 'left',
      required: false,
    },
    {
      name: 'branch.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'company.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'permission.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },

    {
      name: 'level',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      align: 'left',
      required: false,
    },

    {
      name: 'creationUser.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'updateUser.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'creationDate',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'date',
      project: `{ "$dateToString": { "date": "$creationDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
      align: 'left',
      required: false,
    },
    {
      name: 'updateDate',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
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
      title: 'update',
      icon: 'fa fa-pencil',
      class: 'btn btn-primary btn-sm',
      click: `this.emitEvent('update', item)`,
    },
    {
      title: 'delete',
      icon: 'fa fa-trash-o',
      class: 'btn btn-danger btn-sm',
      click: `this.emitEvent('delete', item)`,
    },
  ];

  public headerButtons: IButton[] = [
    {
      title: 'add',
      icon: 'fa fa-plus',
      class: 'btn btn-light',
      click: `this.emitEvent('add', null)`,
    },
    {
      title: 'refresh',
      icon: 'fa fa-refresh',
      class: 'btn btn-light',
      click: `this.refresh()`,
    },
  ];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: UserService,
    private _router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.applyProfile(this.route.snapshot.params['profile']);
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const slug = params['profile'] === 'external' ? 'external' : 'system';
      if (slug === this.profileSlug) {
        return;
      }
      this.applyProfile(slug);
      this.refreshDatatable();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public async emitEvent(event) {
    await this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        await this._router.navigate([`/entities/users/view/${this.profileSlug}/${obj._id}`]);
        break;
      case 'add':
        await this._router.navigate([`/entities/users/add/${this.profileSlug}`]);
        break;
      case 'update':
        await this._router.navigate([`/entities/users/update/${this.profileSlug}/${obj._id}`]);
        break;
      case 'delete':
        await this._router.navigate([`/entities/users/delete/${this.profileSlug}/${obj._id}`]);
        break;
      default:
        break;
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }

  private applyProfile(slug: string): void {
    this.profileSlug = slug === 'external' ? 'external' : 'system';
    this.profile = this.profileSlug === 'external' ? 'Externo' : 'Interno';
    this.title = this.profileSlug === 'external' ? 'Usuarios externos' : 'Usuarios sistema';

    const companyColumn = this.columns.find((column) => column.name === 'company.name');
    if (companyColumn) {
      companyColumn.visible = this.profile === 'Externo';
    }
    const sessionColumn = this.columns.find((column) => column.name === 'tokenExpiration');
    if (sessionColumn) {
      sessionColumn.visible = this.profile !== 'Externo';
    }

    const filter = this.profile === 'Externo' ? `{ "$eq": "Externo" }` : `{ "$ne": "Externo" }`;
    const profileColumn = this.columns.find((column) => column.name === 'profile');
    if (profileColumn) {
      profileColumn.defaultFilter = filter;
      return;
    }

    this.columns.push({
      name: 'profile',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      defaultFilter: filter,
      project: null,
      align: 'left',
      required: true,
    });
  }

  private refreshDatatable(): void {
    if (!this.datatableComponent) {
      return;
    }
    const filter = this.profile === 'Externo' ? `{ "$eq": "Externo" }` : `{ "$ne": "Externo" }`;
    if (this.datatableComponent.filters) {
      this.datatableComponent.filters['profile'] = filter;
    }
    this.datatableComponent.currentPage = 1;
    this.datatableComponent.refresh();
  }
}
