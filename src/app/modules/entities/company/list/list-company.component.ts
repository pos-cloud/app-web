import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '@core/services/company.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImportComponent } from '@shared/components/import/import.component';

import { AuthService } from '@core/services/auth.service';
import { ConfigService } from '@core/services/config.service';
import { CompanyType, IAttribute, IButton } from '@types';
import { Config } from 'app/app.config';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { CurrentAccountDetailsComponent } from 'app/components/print/current-account-details/current-account-details.component';
import { BusinessModel } from 'app/core/enums/business-model.enum';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list-companies',
  templateUrl: './list-company.component.html',
  standalone: true,
  imports: [DatatableModule],
  encapsulation: ViewEncapsulation.None,
})
export class ListCompanyComponent implements OnInit, OnDestroy {
  public companyType: string;
  public title: string;
  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  public sort = { name: 1 };
  public type;
  public user;
  public columns: IAttribute[] = [
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
      name: 'fantasyName',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'identificationType.name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'identificationValue',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'vatCondition.description',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'address',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'grossIncome',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'gender',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },

    {
      name: 'country.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'floorNumber',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'flat',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },

    {
      name: 'state.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'transport.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'priceList.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'account.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'creditLimit',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'discount',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'zipCode',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'addressNumber',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'city',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'phones',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'emails',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'birthday',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'date',
      project: `{ "$dateToString": { "date": "$birthday", "format": "%d/%m/%Y"} }`,
      align: 'left',
      required: false,
    },
    {
      name: 'allowCurrentAccount',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      align: 'left',
      required: false,
    },
    {
      name: 'observation',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'group.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'subscription.active',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      align: 'left',
      required: false,
    },
    {
      name: 'subscription.paymentMethod.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'subscription.article.description',
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
      name: 'employee._id',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      defaultFilter: null,
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
      project: null,
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
  public headerButtons: IButton[] = [];
  public rowButtons: IButton[] = [];
  public config: Config;

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: CompanyService,
    private _router: Router,
    private route: ActivatedRoute,
    private _modalService: NgbModal,
    private _authService: AuthService,
    private _configService: ConfigService
  ) {}

  ngOnInit(): void {
    this._configService.getConfig.pipe(takeUntil(this.destroy$)).subscribe((config) => {
      this.config = config;
      if (this.user) {
        this.configureButtons();
      }
    });
    this.getPermissions();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const companyType = params['type'];
      if (!companyType) {
        return;
      }

      const typeChanged = !!this.companyType && this.companyType !== companyType;
      this.type = companyType === 'client' ? CompanyType.Client : CompanyType.Provider;
      this.title = this.type;
      this.updateTypeColumn();
      this.companyType = companyType;
      this.configureButtons();

      if (typeChanged) {
        this.refreshDatatable();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateTypeColumn(): void {
    const typeFilter = `{ "$eq": "${this.type}" }`;
    const typeColumn = this.columns.find((column) => column.name === 'type');

    if (typeColumn) {
      typeColumn.defaultFilter = typeFilter;
      return;
    }

    this.columns.push({
      name: 'type',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      defaultFilter: typeFilter,
      project: null,
      align: 'left',
      required: true,
    });
  }

  private refreshDatatable(): void {
    if (!this.datatableComponent) {
      return;
    }

    if (this.datatableComponent.filters) {
      this.datatableComponent.filters['type'] = `{ "$eq": "${this.type}" }`;
    }
    this.datatableComponent.currentPage = 1;
    this.datatableComponent.refresh();
  }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    let modalRef;
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/companies/view/' + this.companyType + '/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/companies/update/' + this.companyType + '/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/companies/delete/' + this.companyType + '/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/companies/add/' + this.companyType);
        break;
      case 'current-account2':
        this._router.navigateByUrl('reports/current-account/' + obj._id);
        break;
      case 'subscription-history':
        this._router.navigate(['/reports/subscription-history-by-client'], {
          queryParams: {
            company: obj._id,
            returnTo: `/entities/companies/${this.companyType}`,
          },
        });
        break;
      case 'current-account1':
        this._router.navigateByUrl('admin/cuentas-corrientes?companyId=' + obj._id + '&companyType=' + this.type);
        break;
      case 'current':
        modalRef = this._modalService.open(CurrentAccountDetailsComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.companyType = this.type;
        modalRef.result.then(
          (result) => {},
          (reason) => {}
        );
        break;
      case 'uploadFile':
        modalRef = this._modalService.open(ImportComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.model = 'company';
        modalRef.componentInstance.title = 'Importar empresas';
        modalRef.result.then(
          (result) => {
            if (result === 'save_close') {
              this.datatableComponent.refresh();
            }
          },
          (reason) => {}
        );

        break;
    }
  }

  private getPermissions(): void {
    this._authService.getIdentity.pipe(takeUntil(this.destroy$)).subscribe((identity) => {
      if (!identity) {
        return;
      }
      this.user = identity;
      this.configureButtons();
      this.configureEmployeeFilter();
    });
  }

  private isSubscriptionConfig(): boolean {
    const businessModel = this.config?.businessModel;
    if (typeof businessModel !== 'string') {
      return false;
    }

    const model = businessModel.trim().toLowerCase();
    return model === BusinessModel.SuscripcionesYMembresias || model === BusinessModel.Asociacion;
  }

  private configureButtons(): void {
    if (!this.user) {
      return;
    }

    this.rowButtons = [];
    this.headerButtons = [];

    this.rowButtons.push({
      title: 'view',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `this.emitEvent('view', item, null)`,
    });

    if (this.user.permission.collections.companies.edit) {
      this.rowButtons.push({
        title: 'update',
        class: 'btn btn-primary btn-sm',
        icon: 'fa fa-pencil',
        click: `this.emitEvent('update', item, null)`,
      });
    }
    if (this.user.permission.collections.companies.delete) {
      this.rowButtons.push({
        title: 'delete',
        class: 'btn btn-danger btn-sm',
        icon: 'fa fa-trash-o',
        click: `this.emitEvent('delete', item, null)`,
      });
    }

    this.rowButtons.push(
      {
        title: 'current-account1',
        class: 'btn btn-light btn-sm',
        icon: 'fa fa-book',
        click: `this.emitEvent('current-account1', item)`,
      },
      {
        title: 'current-account2',
        class: 'btn btn-light btn-sm',
        icon: 'fa fa-address-book',
        click: `this.emitEvent('current-account2', item)`,
      }
    );

    if (this.type === CompanyType.Client && this.isSubscriptionConfig()) {
      this.rowButtons.push({
        title: 'subscription-history',
        class: 'btn btn-light btn-sm',
        icon: 'fa fa-history',
        click: `this.emitEvent('subscription-history', item)`,
      });
    }

    if (this.user.permission.collections.companies.add) {
      this.headerButtons.push({
        title: 'add',
        class: 'btn btn-light',
        icon: 'fa fa-plus',
        click: `this.emitEvent('add', null)`,
      });
    }

    this.headerButtons.push(
      {
        title: 'Detalle de cuenta corriente',
        class: 'btn',
        icon: 'fa fa-book',
        click: `this.emitEvent('current', null)`,
      },
      {
        title: 'refresh',
        class: 'btn btn-light',
        icon: 'fa fa-refresh',
        click: `this.refresh()`,
      },
      {
        title: 'import',
        class: 'btn btn-light',
        icon: 'fa fa-upload',
        click: `this.emitEvent('uploadFile', null)`,
      }
    );
  }
  private configureEmployeeFilter(): void {
    if (this.user.permission?.filterCompany && this.user.employee?._id) {
      const employeeColumn = this.columns.find((column) => column.name === 'employee._id');
      if (employeeColumn) {
        employeeColumn.defaultFilter = `{ "$oid": "${this.user.employee._id}" }`;
        employeeColumn.required = true;
      }
    }
  }
}
