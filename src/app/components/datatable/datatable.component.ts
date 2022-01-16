import { Component, ViewEncapsulation, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { DatatableController } from './datatable.controller';
import { CapitalizePipe } from 'app/main/pipes/capitalize';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { TranslatePipe } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ExportExcelComponent } from '../export/export-excel/export-excel.component';
import { IAttribute } from 'app/util/attribute.interface';
import { IButton } from 'app/util/buttons.interface';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslateMePipe, TranslatePipe]
})

export class DatatableComponent {

  public items: any[] = new Array();
  @Input() loading: boolean = false;
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();
  private URL: string;

  @Output() eventFunction = new EventEmitter<{ op: string, obj: any }>();

  // TABLA
  public datatableController: DatatableController;
  public filters: any[];
  public currentPage: number = 0;
  public itemsPerPage = 10;
  public totalItems = 0;
  @Input() title: string;
  @Input() sort: {};
  @Input() columns: IAttribute[];
  @Input() rowButtons: IButton[];
  @Input() headerButtons: IButton[];
  @Input() _service: any;

  // EXCEL
  @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;

  constructor(
    private _title: Title,
    private _toastr: ToastrService,
    public alertConfig: NgbAlertConfig,
    private translatePipe: TranslateMePipe,
    private _router: Router,
    private _route: ActivatedRoute,
    config: NgbDropdownConfig
  ) {
    config.placement = 'bottom-right';
  }

  public async ngOnInit() {
    setTimeout(() => {
      this.title = this.capitalizePipe.transform(this.translatePipe.translateMe(this.title));
      this._title.setTitle(this.title);
    }, 0);
    this.datatableController = new DatatableController(this._service, this.columns);
    this.processParams();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private processParams(): void {
    this.URL = this._router.url.replace(/\//, '');
    if (this.URL.includes('?')) {
      this.URL = this.URL.split('?')[0];
    }
    this.filters = new Array();
    for (let field of this.columns) {
      if (field.defaultFilter) {
        this.filters[field.name] = field.defaultFilter;
      } else {
        this.filters[field.name] = '';
      }
    }
    this._route.queryParams.subscribe(params => {
      try {
        this.currentPage = parseInt(params['currentPage']);
        if (isNaN(this.currentPage)) this.currentPage = 0;
      } catch { }
      try {
        if (params['itemsPerPage'] && params['itemsPerPage'] !== 0) this.itemsPerPage = parseInt(params['itemsPerPage']);
      } catch { }
      Object.keys(params).map(key => {
        if (key !== 'currentPage' &&
          params[key] && params[key] !== '') {
          this.filters[key] = params[key];
        }
      });
      if (!this.subscription['_subscriptions'] || this.subscription['_subscriptions'].length === 0) {
        this.getItems();
      }
    });
  }

  public runEvent(event: any, item: any) {
    eval(event);
  }

  public getValue(item, column): any {
    return (typeof this.datatableController.getValue(item, column) === 'string') ?
      this.translatePipe.transform(this.datatableController.getValue(item, column)) :
      this.datatableController.getValue(item, column);
  }

  public exportItems(): void {
    this.exportExcelComponent.items = this.items;
    this.exportExcelComponent.export();
  }

  public orderBy(term: string): void {

    if (this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

    this.getItems();
  }

  public async emitEvent(op: string, obj: any) {
    this.eventFunction.emit({ op, obj });
  };

  public refresh(): void {
    this.getItems();
  }

  public addFilters(): void {
    this._router.navigate([this.URL], {
      queryParams: this.filters
    });
  }

  public async getItems() {
    this.loading = true;
    this.subscription.add(
      await this.datatableController.getItems(
        this.filters,
        this.currentPage,
        this.itemsPerPage,
        this.sort
      ).then(result => {
        if (result.status === 200) {
          if (result.result.length > 0) {
            if (this.itemsPerPage === 0) {
              this.exportExcelComponent.items = result.result[0].items;
              this.exportExcelComponent.export();
              this.itemsPerPage = 10;
            } else {
              this.items = result.result[0].items;
              this.totalItems = result.result[0].count;
            }
          } else {
            this.items = [];
            this.totalItems = 0;
          }
        } else this.showToast(result);
      }).catch(error => this.showToast(error))
    );
    this.loading = false;
  }

  public pageChange(page): void {
    this.currentPage = page;
    let queryParams = {};
    queryParams = Object.assign(queryParams, this.filters);
    queryParams['currentPage'] = this.currentPage;
    this._router.navigate([this.URL], {
      queryParams: queryParams
    });
  }

  public changeItemsPerPage(): void {
    let queryParams = {};
    queryParams = Object.assign(queryParams, this.filters);
    queryParams['itemsPerPage'] = this.itemsPerPage;
    this._router.navigate([this.URL], {
      queryParams: queryParams
    });
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status === 500 || result.status === 400) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else if (result.status === 401) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      case 'danger':
        this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      case 'warning':
        this._toastr.warning(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      default:
        this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
    }
    this.loading = false;
  }
}
