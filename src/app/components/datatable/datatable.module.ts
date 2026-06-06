import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { ColumnsConfigComponent } from '../../shared/components/columns-config/columns-config.component';
import { ExportExcelModule } from '../../shared/components/export-excel/export-excel.module';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { DatatableComponent } from './datatable.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExportExcelModule,
    DragDropModule,
    TranslateModule,
    ProgressbarModule,
    PipesModule,
    NgbModule,
    ColumnsConfigComponent,
  ],
  exports: [DatatableComponent],
  declarations: [DatatableComponent],
  providers: [],
})
export class DatatableModule {}
