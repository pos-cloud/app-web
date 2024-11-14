import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { ExportersModule } from '../components/export/exporters.module';
import { LicenseGuard } from '../core/guards/license.guard';
import { ProgressbarModule } from '../shared/components/progressbar/progressbar.module';

import { CompanyService } from 'app/components/company/company.service';
import { PipesModule } from 'app/core/pipes/pipes.module';
import { CurrentAccountComponent } from './current-account/current-account.component';
import { CurrentAccountService } from './current-account/current-account.service';
import { ListArticlesRequirementsByTransactionComponent } from './list-articles-requirements-by-transaction/list-articles-requirements-by-transaction.component';
import { ListArticlesRequirementsByTransactionService } from './list-articles-requirements-by-transaction/list-articles.requirements-by-transaction.service';

const routes: Routes = [
  {
    path: 'production/requierements',
    component: ListArticlesRequirementsByTransactionComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'current-account/:id',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ProgressbarModule,
    TranslateModule,
    PipesModule,
    NgbModule,
    NgMultiSelectDropDownModule,
    NgxPaginationModule,
    ExportersModule,
  ],
  declarations: [
    ListArticlesRequirementsByTransactionComponent,
    CurrentAccountComponent,
  ],
  providers: [
    ListArticlesRequirementsByTransactionService,
    CurrentAccountService,
    CompanyService,
  ],
})
export class ReportsModule {}
