import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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

  public exportItems(): void {
    this.exportExcelComponent.items = this.data;
    this.exportExcelComponent.export();
  }

  constructor(private _title: Title) {}

  ngOnInit(): void {
    this._title.setTitle(this.title);
  }
}
