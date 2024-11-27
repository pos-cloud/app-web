import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { ExportersModule } from '../export/exporters.module';
import { DatatableComponent } from './datatable.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FocusDirective,
    ExportersModule,
    DragDropModule,
    TranslateModule,
    ProgressbarModule,
    PipesModule,
    NgbDropdownModule,
  ],
  exports: [DatatableComponent],
  declarations: [DatatableComponent],
  providers: [],
})
export class DatatableModule {}
