import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './crud/report.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import { ReportService } from './report.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule } from '../datatable/datatable.module';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/main/pipes/pipes.module';
import { ListReportsComponent } from './list-reports/list-reports.component';
import { ViewReportComponent } from './view-report/view-report.component';
import { NgxTinymceModule } from 'ngx-tinymce';

const routes: Routes = [
  {
    path: 'reports',
    component: ListReportsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reports/add',
    component: ReportComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reports/view/:id',
    component: ReportComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reports/update/:id',
    component: ReportComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reports/delete/:id',
    component: ReportComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'view-report/:name',
    component: ViewReportComponent,
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
    ListReportsComponent,
    ReportComponent,
    ViewReportComponent
  ],
  exports: [
    ReportComponent,
    ViewReportComponent
  ],
  entryComponents: [
    ReportComponent,
    ViewReportComponent
  ],
  providers: [
    ReportService
  ]
})

export class ReportModule { }
