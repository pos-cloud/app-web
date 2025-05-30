import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CompanyService } from '@core/services/company.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ToastService } from '@shared/components/toast/toast.service';
import { Company, CompanyType, IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CompanyComponent } from '../crud/company.component';

@Component({
  selector: 'app-select-company',
  templateUrl: './select-company.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class SelectCompanyComponent implements OnInit {
  @Input() type: CompanyType;
  public title: CompanyType;
  public loading: boolean = false;
  public sort = { name: 1 };
  private destroy$ = new Subject<void>();
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
      name: 'addressNumber',
      visible: true,
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
      visible: true,
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
  public headerButtons: IButton[] = [
    {
      title: 'return',
      class: 'btn btn-light',
      icon: 'fa fa-arrow-left',
      click: `this.emitEvent('return', item)`,
    },
    {
      title: 'add',
      class: 'btn btn-light',
      icon: 'fa fa-plus',
      click: `this.emitEvent('add', null)`,
    },
  ];
  public rowButtons: IButton[] = [
    {
      title: 'update',
      class: 'btn btn-primary btn-sm',
      icon: 'fa fa-pencil',
      click: `this.emitEvent('update', item)`,
    },
  ];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: CompanyService,
    private _modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.setColumn();
  }
  setColumn() {
    this.title = this.type;
    this.columns.push({
      name: 'type',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      defaultFilter: `{ "$eq": "${this.type}" }`,
      project: null,
      align: 'left',
      required: true,
    });
  }
  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    let modalRef;
    switch (op) {
      case 'update':
        modalRef = this._modalService.open(CompanyComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.property = {
          companyId: obj._id,
          operation: 'update',
          type: this.type,
        };
        modalRef.result.then(
          (result) => {
            this.selectCompany(result?.company);
          },
          (reason) => {
            this.datatableComponent.refresh();
          }
        );
        break;
      case 'add':
        modalRef = this._modalService.open(CompanyComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.property = {
          companyId: null,
          operation: 'add',
          type: this.type,
        };

        modalRef.result.then(
          (result) => {
            this.selectCompany(result?.company);
          },
          (reason) => {
            this.datatableComponent.refresh();
          }
        );
        break;
      case 'return':
        this.activeModal.close();
        break;
      case 'on-click':
        this.selectCompany(obj);
        break;
    }
  }

  public selectCompany(companySelected: Company): void {
    if (companySelected) {
      this._service
        .getCompany(companySelected._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result && result.company) {
              this.activeModal.close({ company: result.company });
            }
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
}
