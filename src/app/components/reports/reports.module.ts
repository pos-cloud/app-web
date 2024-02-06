import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ExportersModule } from '../export/exporters.module';
import { LicenseGuard } from '../../main/guards/license.guard';

import { ListArticlesRequirementsByTransactionComponent } from './list-articles-requirements-by-transaction/list-articles-requirements-by-transaction.component';
import { ReportsService } from './reports.service';

const routes: Routes = [
    {
        path: 'reports/production/requierements',
        component: ListArticlesRequirementsByTransactionComponent,
        canActivate: [AuthGuard, LicenseGuard]
      },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        FormsModule,
        DirectivesModule,
        ProgressbarModule,
        TranslateModule,
        NgbModule,
        NgMultiSelectDropDownModule,
        NgxPaginationModule,
        ExportersModule
    ],
    declarations: [
        ListArticlesRequirementsByTransactionComponent
    ],
    providers: [
        ReportsService
    ]
})

export class ReportsModule { }
