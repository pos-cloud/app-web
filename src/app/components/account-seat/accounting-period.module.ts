import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule } from '../datatable/datatable.module';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/main/pipes/pipes.module';
import { NgxTinymceModule } from 'ngx-tinymce';
import { ListAccountingPeriodsComponent } from './list-accounting-periods/list-accounting-periods.component';
import { AccountingPeriodService } from './accounting-period.service';
import { AccountingPeriodComponent } from './crud/accounting-period.component';

const routes: Routes = [
  {
    path: 'accounting-periods',
    component: ListAccountingPeriodsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'accounting-periods/add',
    component: AccountingPeriodComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'accounting-periods/view/:id',
    component: AccountingPeriodComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'accounting-periods/update/:id',
    component: AccountingPeriodComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'accounting-periods/delete/:id',
    component: AccountingPeriodComponent,
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
    AccountingPeriodComponent,
    ListAccountingPeriodsComponent
  ],
  exports: [
    AccountingPeriodComponent
  ],
  entryComponents: [
    AccountingPeriodComponent
  ],
  providers: [
    AccountingPeriodService
  ]
})

export class AccountModule { }
