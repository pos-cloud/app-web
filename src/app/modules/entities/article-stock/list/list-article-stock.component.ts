import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleStockService } from '@core/services/article-stock.service';
import { StructureService } from '@core/services/structure.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationQuestionComponent } from '@shared/components/confirm/confirmation-question.component';
import { ToastService } from '@shared/components/toast/toast.service';
import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';

@Component({
  selector: 'app-list-structure',
  templateUrl: './list-article-stock.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListArticleStockComponent {
  public title: string = 'inventory';
  public sort = { code: 1 };

  public pathLocation: string[];
  public loading: boolean = false;
  public headerButtons: IButton[] = [
    // {
    //   title: 'update-cost',
    //   class: 'btn btn-light',
    //   icon: 'fa fa-dollar',
    //   click: `this.emitEvent('update-base-price', null)`,
    // },
    // {
    //   title: 'add',
    //   class: 'btn btn-light',
    //   icon: 'fa fa-plus',
    //   click: `this.emitEvent('add', null)`,
    // },
    {
      title: 'refresh',
      class: 'btn btn-light',
      icon: 'fa fa-refresh',
      click: `this.refresh()`,
    },
  ];
  public rowButtons: IButton[] = [
    // {
    //   title: 'view',
    //   class: 'btn btn-success btn-sm',
    //   icon: 'fa fa-eye',
    //   click: `this.emitEvent('view', item)`,
    // },
    // {
    //   title: 'update',
    //   class: 'btn btn-primary btn-sm',
    //   icon: 'fa fa-pencil',
    //   click: `this.emitEvent('update', item)`,
    // },
    // {
    //   title: 'delete',
    //   class: 'btn btn-danger btn-sm',
    //   icon: 'fa fa-trash-o',
    //   click: `this.emitEvent('delete', item)`,
    // },
  ];
  public columns: IAttribute[] = [
    {
      name: '_id',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'article',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      defaultFilter: `{ "$exists": true }`,
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.make.description',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.category.description',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.category.parent.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.code',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.barcode',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.description',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.observation',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.variantType1.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'article.variantValue1.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'article.unitOfMeasurement.abbreviation',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.posDescription',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.ecommerceEnabled',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: `{"$toString":"$article.ecommerceEnabled"}`,
      align: 'left',
      required: false,
    },
    {
      name: 'applicationsName',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{"$reduce":{"input":"$article.applications.name","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
      align: 'left',
      required: false,
    },
    {
      name: 'article.otherFieldsValues',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{"$reduce":{"input":"$article.otherFields.value","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
      align: 'left',
      required: false,
    },
    {
      name: 'realStock',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.minStock',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.maxStock',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.pointOfOrder',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.basePrice',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.codeProvider',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'article.containsStructure',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'article.salePrice',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'article.currency.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.currency.quotation',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.costPrice',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article._id',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'creationDate',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$dateToString": { "date": "$creationDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
      align: 'left',
      required: true,
    },
    {
      name: 'updateDate',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
      align: 'left',
      required: true,
    },
    {
      name: 'total',
      visible: true,
      disabled: true,
      filter: true,
      datatype: 'currency',
      project: `{ "$multiply": [ "$article.costPrice", "$realStock" ] }`,
      align: 'right',
      required: true,
    },
    {
      name: 'article.operationType',
      visible: false,
      disabled: true,
      filter: true,
      defaultFilter: `{ "$ne": "D" }`,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'operationType',
      visible: false,
      disabled: true,
      filter: true,
      defaultFilter: `{ "$ne": "D" }`,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'article.allowStock',
      visible: false,
      disabled: true,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'deposit',
      visible: false,
      disabled: true,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'branch',
      visible: false,
      disabled: true,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
  ];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: ArticleStockService,
    private _router: Router,
    private _modalService: NgbModal,
    private _structureService: StructureService,
    private _toastService: ToastService
  ) {}

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
