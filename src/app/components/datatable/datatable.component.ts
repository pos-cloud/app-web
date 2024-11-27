import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlertConfig, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { IAttribute, IButton } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { CapitalizePipe } from 'app/shared/pipes/capitalize';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Subscription } from 'rxjs';
import { ExportExcelComponent } from '../export/export-excel/export-excel.component';
import { DatatableController } from './datatable.controller';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslateMePipe, TranslatePipe],
})
export class DatatableComponent {
  public items: any[] = new Array();
  @Input() loading: boolean = false;
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();

  @Output() eventFunction = new EventEmitter<{
    op: string;
    obj: any;
    items: any[];
  }>();

  // TABLA
  public datatableController: DatatableController;
  public filters: any;
  public currentPage: number = 0;
  public itemsPerPage = 10;
  public totalItems = 0;
  @Input() title: string;
  @Input() sort: {};
  @Input() columns: IAttribute[];
  @Input() rowButtons: IButton[];
  @Input() headerButtons: IButton[];
  @Input() _service: any;

  // Identificador único para este componente
  private identifier: string;

  // EXCEL
  @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;

  constructor(
    private _title: Title,
    private _toastService: ToastService,
    public alertConfig: NgbAlertConfig,
    private translatePipe: TranslateMePipe,
    private _router: Router,
    private _route: ActivatedRoute,
    config: NgbDropdownConfig
  ) {
    config.placement = 'bottom-right';
  }

  public async ngOnInit() {
    this.identifier = this.title.replace(/\s+/g, '-').toLowerCase();
    setTimeout(() => {
      this.title = this.capitalizePipe.transform(
        this.translatePipe.translateMe(this.title)
      );
      this._title.setTitle(this.title);
    }, 0);
    this.datatableController = new DatatableController(
      this._service,
      this.columns
    );
    this.loadColumnVisibility();
    this.processParams();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadColumnVisibility(): void {
    const storedColumnVisibility = JSON.parse(
      localStorage.getItem(`${this.identifier}_columnVisibility`) || '{}'
    );

    this.columns.forEach((column) => {
      if (storedColumnVisibility[column.name] !== undefined) {
        column.visible = storedColumnVisibility[column.name];
      }
    });
  }

  private saveColumnVisibility(): void {
    const columnVisibility = {};
    this.columns.forEach((column) => {
      columnVisibility[column.name] = column.visible;
    });
    localStorage.setItem(
      `${this.identifier}_columnVisibility`,
      JSON.stringify(columnVisibility)
    );
    this.getItems();
  }

  private processParams(): void {
    // Recupera los filtros desde localStorage
    const storedFilters = JSON.parse(
      localStorage.getItem(`${this.identifier}_datatableFilters`) || '{}'
    );
    this.filters = {};

    for (let field of this.columns) {
      this.filters[field.name] =
        storedFilters[field.name] || field.defaultFilter || '';
    }

    // Recupera currentPage e itemsPerPage desde localStorage
    this.currentPage = parseInt(
      localStorage.getItem(`${this.identifier}_currentPage`) || '0',
      10
    );
    this.itemsPerPage = parseInt(
      localStorage.getItem(`${this.identifier}_itemsPerPage`) || '10',
      10
    );

    this.currentPage = 0;

    this.getItems();
  }

  public runEvent(event: any, item: any, items: any[]) {
    eval(event);
  }

  public getValue(item, column): any {
    return typeof this.datatableController.getValue(item, column) === 'string'
      ? this.translatePipe.transform(
          this.datatableController.getValue(item, column)
        )
      : this.datatableController.getValue(item, column);
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

  public async emitEvent(op: string, obj: any, items) {
    this.eventFunction.emit({ op, obj, items: this.items });
  }

  public refresh(): void {
    this.getItems();
  }

  public addFilters(): void {
    console.log(this.filters);
    localStorage.setItem(
      `${this.identifier}_datatableFilters`,
      JSON.stringify(this.filters)
    );
    this.getItems();
  }

  public async getItems() {
    this.loading = true;
    this.subscription.add(
      await this.datatableController
        .getItems(this.filters, this.currentPage, this.itemsPerPage, this.sort)
        .then((result) => {
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
          } else this._toastService.showToast(result);
        })
        .catch((error) => this._toastService.showToast(error))
    );
    this.loading = false;
  }

  public pageChange(page): void {
    this.currentPage = page;
    // Guarda la página actual en localStorage
    localStorage.setItem(
      `${this.identifier}_currentPage`,
      this.currentPage.toString()
    );
    this.getItems();
  }

  public changeItemsPerPage(): void {
    // Guarda itemsPerPage en localStorage
    localStorage.setItem(
      `${this.identifier}_itemsPerPage`,
      this.itemsPerPage.toString()
    );
    this.getItems();
  }
}
