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
import { ListAccountPeriodsComponent } from './list-account-periods/list-account-periods.component';
import { AccountPeriodService } from './account-period.service';
import { AccountPeriodComponent } from './crud/account-period.component';

const routes: Routes = [
  {
    path: 'account-periods',
    component: ListAccountPeriodsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'account-periods/add',
    component: AccountPeriodComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'account-periods/view/:id',
    component: AccountPeriodComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'account-periods/update/:id',
    component: AccountPeriodComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'account-periods/delete/:id',
    component: AccountPeriodComponent,
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
    AccountPeriodComponent,
    ListAccountPeriodsComponent
  ],
  exports: [
    AccountPeriodComponent
  ],
  entryComponents: [
    AccountPeriodComponent
  ],
  providers: [
    AccountPeriodService
  ]
})

export class AccountPeriodModule { }
