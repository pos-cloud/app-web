import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { PipesModule } from 'app/main/pipes/pipes.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from './datatable.component';
import { ExportersModule } from '../export/exporters.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    DirectivesModule,
    ExportersModule,
    DragDropModule,
    TranslateModule,
    ProgressbarModule,
    PipesModule,
    NgbDropdownModule
  ],
  exports: [
    DatatableComponent
  ],
  declarations: [
    DatatableComponent,
  ],
  providers: [
  ]
})

export class DatatableModule { }
