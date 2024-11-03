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
import { ExportersModule } from '../export/exporters.module';
import { AccountSeatService } from './account-seat.service';
import { AccountSeatComponent } from './crud/account-seat.component';
import { ListAccountSeatsComponent } from './list-account-seats/list-account-seats.component';
import { ReportDetailsLedgerComponent } from './report-details-ledger/report-details-ledger.component';
import { ReportLedgerComponent } from './report-ledger/report-ledger.component';

const routes: Routes = [
  {
    path: 'account-seats',
    component: ListAccountSeatsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-seats/add',
    component: AccountSeatComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-seats/view/:id',
    component: AccountSeatComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-seats/update/:id',
    component: AccountSeatComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-seats/delete/:id',
    component: AccountSeatComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-seats/delete/:id',
    component: AccountSeatComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/accountant/ledger',
    component: ReportLedgerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/accountant/details/ledger/:id/:startDate/:endDate/:name',
    component: ReportDetailsLedgerComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    ExportersModule,
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
  declarations: [
    AccountSeatComponent,
    ListAccountSeatsComponent,
    ReportLedgerComponent,
    ReportDetailsLedgerComponent,
  ],
  exports: [AccountSeatComponent],
  providers: [AccountSeatService],
})
export class AccountSeatModule {}
