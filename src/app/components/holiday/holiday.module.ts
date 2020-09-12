import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HolidayComponent } from './crud/holiday.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import { HolidayService } from './holiday.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule } from '../datatable/datatable.module';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/main/pipes/pipes.module';
import { ListHolidaysComponent } from './list-holidays/list-holidays.component';
import { NgxTinymceModule } from 'ngx-tinymce';

const routes: Routes = [
  {
    path: 'holidays',
    component: ListHolidaysComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'holidays/add',
    component: HolidayComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'holidays/view/:id',
    component: HolidayComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'holidays/update/:id',
    component: HolidayComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'holidays/delete/:id',
    component: HolidayComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    DirectivesModule,
    DragDropModule,
    ProgressbarModule,
    PipesModule,
    TranslateModule,
    NgbDropdownModule,
    NgbModule,
    DatatableModule,
    NgxTinymceModule
  ],
  declarations: [
    ListHolidaysComponent,
    HolidayComponent
  ],
  exports: [
    HolidayComponent
  ],
  entryComponents: [
    HolidayComponent
  ],
  providers: [
    HolidayService
  ]
})

export class HolidayModule { }
