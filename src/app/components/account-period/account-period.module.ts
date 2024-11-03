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
import { AccountPeriodService } from './account-period.service';
import { AccountPeriodComponent } from './crud/account-period.component';
import { ListAccountPeriodsComponent } from './list-account-periods/list-account-periods.component';

const routes: Routes = [
  {
    path: 'account-periods',
    component: ListAccountPeriodsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-periods/add',
    component: AccountPeriodComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-periods/view/:id',
    component: AccountPeriodComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-periods/update/:id',
    component: AccountPeriodComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-periods/delete/:id',
    component: AccountPeriodComponent,
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
  declarations: [AccountPeriodComponent, ListAccountPeriodsComponent],
  exports: [AccountPeriodComponent],
  providers: [AccountPeriodService],
})
export class AccountPeriodModule {}
