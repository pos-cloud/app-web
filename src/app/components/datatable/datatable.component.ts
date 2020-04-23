import { Component, ViewEncapsulation, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { CapitalizePipe } from 'app/main/pipes/capitalize';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { TranslatePipe } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatatableController } from './datatable.controller';
import { ExportExcelComponent } from '../export/export-excel/export-excel.component';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslateMePipe, TranslatePipe]
})

export class DatatableComponent {

  public items: any[] = new Array();
  public loading: boolean = false;
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();
  private URL: string;

  @Output() eventFunction = new EventEmitter<{ op: string, obj: any }>();

  // // TABLA
  public datatableController: DatatableController;
  public filters: any[];
  public currentPage: number = 0;
  public itemsPerPage = 10;
  public totalItems = 0;
  @Input() title: string;
  @Input() sort: {};
  @Input() columns: any[];
  @Input() _service: any;

  // //EXCEL
  @ViewChild(ExportExcelComponent, { static: false }) exportExcelComponent: ExportExcelComponent;

  constructor(
    private _title: Title,
    private _toastr: ToastrService,
    public alertConfig: NgbAlertConfig,
    private translatePipe: TranslateMePipe,
    private _router: Router,
    private _route: ActivatedRoute,
  ) {
  }

  public async ngOnInit() {
    this.title = this.capitalizePipe.transform(this.title);
    this._title.setTitle(this.title);
    this.datatableController = new DatatableController(this._service, this.columns);
    this.processParams();
  }

  public async ngAfterViewInit() {
    this._title.setTitle(this.title);
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

  public getValue(item, column): any {
    return this.datatableController.getValue(item, column);
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
        if (result.result) {
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
        } else (result.error) ? this.showToast(result.error.message, 'info') : this.showToast(result.message, 'info');
      }).catch(err => (err.error) ? this.showToast(err.error.message, 'danger') : this.showToast(err, 'danger'))
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

  public showToast(message: string, type: string = 'success'): void {
    switch (type) {
      case 'success':
        this._toastr.success('', this.translatePipe.translateMe(message.toString()));
        break;
      case 'info':
        this._toastr.info('', this.translatePipe.translateMe(message.toString()));
        break;
      case 'warning':
        this._toastr.warning('', this.translatePipe.translateMe(message.toString()));
        break;
      case 'danger':
        this._toastr.error('', this.translatePipe.translateMe(message.toString()));
        break;
      default:
        this._toastr.success('', this.translatePipe.translateMe(message.toString()));
        break;
    }
  }
}
