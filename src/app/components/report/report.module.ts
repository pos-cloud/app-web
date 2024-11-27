import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { NgxTinymceModule } from 'ngx-tinymce';
import { ReportService } from '../../core/services/report.service';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { DatatableModule } from '../datatable/datatable.module';
import { ExportersModule } from '../export/exporters.module';
import { ReportComponent } from './crud/report.component';
import { ListReportsComponent } from './list-reports/list-reports.component';
import { ParamsReportComponent } from './params-report/params-report.component';
import { ViewReportComponent } from './view-report/view-report.component';

const routes: Routes = [
  {
    path: 'reports',
    component: ListReportsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'reports/add',
    component: ReportComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'reports/view/:id',
    component: ReportComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'reports/update/:id',
    component: ReportComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'reports/delete/:id',
    component: ReportComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view-report/:name',
    component: ViewReportComponent,
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
    ExportersModule,
  ],
  declarations: [
    ListReportsComponent,
    ReportComponent,
    ViewReportComponent,
    ParamsReportComponent,
  ],
  exports: [ReportComponent, ViewReportComponent],
  providers: [ReportService],
})
export class ReportModule {}
