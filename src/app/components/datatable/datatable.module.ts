import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/core/pipes/pipes.module';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { ExportersModule } from '../export/exporters.module';
import { ProgressbarModule } from '../progressbar/progressbar.module';
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
