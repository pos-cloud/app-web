import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StructureService } from '@core/services/structure.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationQuestionComponent } from '@shared/components/confirm/confirmation-question.component';
import { ToastService } from '@shared/components/toast/toast.service';
import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';

@Component({
  selector: 'app-list-structure',
  templateUrl: './list-structure.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListStructureComponent {
  public title: string = 'structure';
  public sort = { name: 1 };
  public columns: IAttribute[];
  public pathLocation: string[];
  public loading: boolean = false;
  public headerButtons: IButton[] = [
    {
      title: 'update-cost',
      class: 'btn btn-light',
      icon: 'fa fa-refresh',
      click: `this.emitEvent('update-base-price', null)`,
    },
    {
      title: 'add',
      class: 'btn btn-light',
      icon: 'fa fa-plus',
      click: `this.emitEvent('add', null)`,
    },
    {
      title: 'refresh',
      class: 'btn btn-light',
      icon: 'fa fa-refresh',
      click: `this.refresh()`,
    },
  ];
  public rowButtons: IButton[] = [
    {
      title: 'view',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `this.emitEvent('view', item)`,
    },
    {
      title: 'update',
      class: 'btn btn-primary btn-sm',
      icon: 'fa fa-pencil',
      click: `this.emitEvent('update', item)`,
    },
    {
      title: 'delete',
      class: 'btn btn-danger btn-sm',
      icon: 'fa fa-trash-o',
      click: `this.emitEvent('delete', item)`,
    },
  ];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: StructureService,
    private _router: Router,
    private _modalService: NgbModal,
    private _structureService: StructureService,
    private _toastService: ToastService
  ) {
    this.columns = [
      {
        name: 'parent.code',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'parent.description',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'child.code',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'child.description',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'utilization',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },

      {
        name: 'quantity',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'optional',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
      },

      {
        name: 'increasePrice',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
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
  }

  public async emitEvent(event) {
    this.redirect(event.op, event.obj);
  }

  public async redirect(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/structures/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/structures/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/structures/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/structures/add');
        break;
      case 'update-base-price':
        let modalRef = this._modalService.open(ConfirmationQuestionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.title = 'Actualizar Precios bases';
        modalRef.componentInstance.subtitle =
          'Actualiza los precios de bases de aquellos productos que tienen estructura. Consiste en sumar los precios bases de sus hijos y actualizar el precio base del padre. ¿ Esta seguro de ejectura esta rutina ?';
        modalRef.result.then((result) => {
          if (result) {
            this.loading = true;
            this._structureService.updateBasePriceByStruct().subscribe({
              next: (response) => {
                this._toastService.showToast(response);
              },
              error: (error) => {
                this._toastService.showToast(error);
              },
              complete: () => {
                this.loading = false;
              },
            });
          }
        });
        break;
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }
}
