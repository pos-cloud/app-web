import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { LicenseGuard } from '../../core/guards/license.guard';
import { ExportersModule } from '../export/exporters.module';
import { ProgressbarModule } from '../progressbar/progressbar.module';

import { FocusDirective } from 'app/shared/directives/focus.directive';
import { ListArticlesRequirementsByTransactionComponent } from './list-articles-requirements-by-transaction/list-articles-requirements-by-transaction.component';
import { ReportsService } from './reports.service';

const routes: Routes = [
  {
    path: 'reports/production/requierements',
    component: ListArticlesRequirementsByTransactionComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    FocusDirective,
    ProgressbarModule,
    TranslateModule,
    NgbModule,
    NgMultiSelectDropDownModule,
    NgxPaginationModule,
    ExportersModule,
  ],
  declarations: [ListArticlesRequirementsByTransactionComponent],
  providers: [ReportsService],
})
export class ReportsModule {}
