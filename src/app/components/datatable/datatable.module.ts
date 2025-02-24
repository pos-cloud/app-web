import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { ExportersModule } from '../export/exporters.module';
import { DatatableComponent } from './datatable.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExportersModule,
    DragDropModule,
    TranslateModule,
    ProgressbarModule,
    PipesModule,
    NgbModule,
  ],
  exports: [DatatableComponent],
  declarations: [DatatableComponent],
  providers: [],
})
export class DatatableModule {}
