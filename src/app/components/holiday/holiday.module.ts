import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { PipesModule } from 'app/core/pipes/pipes.module';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { NgxTinymceModule } from 'ngx-tinymce';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { DatatableModule } from '../datatable/datatable.module';
import { HolidayComponent } from './crud/holiday.component';
import { ListHolidaysComponent } from './list-holidays/list-holidays.component';

const routes: Routes = [
  {
    path: 'holidays',
    component: ListHolidaysComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'holidays/add',
    component: HolidayComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'holidays/view/:id',
    component: HolidayComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'holidays/update/:id',
    component: HolidayComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'holidays/delete/:id',
    component: HolidayComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FocusDirective,
    DragDropModule,
    ProgressbarModule,
    PipesModule,
    TranslateModule,
    NgbDropdownModule,
    NgbModule,
    DatatableModule,
    NgxTinymceModule,
  ],
  declarations: [ListHolidaysComponent, HolidayComponent],
  exports: [HolidayComponent],
  providers: [],
})
export class HolidayModule {}
