import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
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

  @Input() sorting: { column: string; direction: string };
  @Output() sortingChange = new EventEmitter<{ column: string; direction: string }>();
  @Output() eventExport = new EventEmitter<boolean>();

  public exportItems(): void {
    // this.exportExcelComponent.items = this.data;
    // this.exportExcelComponent.export();

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

    // Esto actualiza automáticamente el valor en el padre
    this.sortingChange.emit(this.sorting);
  }
}
