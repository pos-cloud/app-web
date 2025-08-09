import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { IButton } from '@types';
import { ExportExcelComponent } from 'app/components/export/export-excel/export-excel.component';
import { ExportersModule } from 'app/components/export/exporters.module';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { ProgressbarModule } from '../progressbar/progressbar.module';

@Component({
  selector: 'app-data-table-reports',
  templateUrl: './data-table-reports.component.html',
  styleUrls: ['./data-table-reports.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, ExportersModule, TranslateModule, PipesModule, ProgressbarModule],
})
export class DataTableReportsComponent implements OnInit {
  @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;

  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() totals = {};
  @Input() title: string = '';
  @Input() loading: boolean = true;
  @Input() rowButtons: IButton[] = [];

  @Input() sorting: { column: string; direction: string };
  @Output() sortingChange = new EventEmitter<{ column: string; direction: string }>();
  @Output() eventExport = new EventEmitter<boolean>();
  @Output() eventFunction = new EventEmitter<{
    op: string;
    obj: any;
    items: any[];
  }>();

  public exportItems(): void {
    this.eventExport.emit(true);
  }

  constructor(private _title: Title) {}

  ngOnInit(): void {
    this._title.setTitle(this.title);
  }

  changeSorting(column: any): void {
    if (this.sorting.column === column.label) {
      this.sorting.direction = this.sorting.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sorting = {
        column: column.label,
        direction: 'asc',
      };
    }
    this.sortingChange.emit(this.sorting);
  }

  public runEvent(event: any, item: any, items: any[]) {
    this.eventFunction.emit({
      op: event,
      obj: item,
      items: items,
    });
  }

  public emitEvent(op: string, obj: any, items: any[]) {
    this.eventFunction.emit({ op, obj, items });
  }
}
