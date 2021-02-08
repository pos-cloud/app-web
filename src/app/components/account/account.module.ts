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
import { ListAccountsComponent } from './list-accounts/list-accounts.component';
import { AccountService } from './account.service';
import { AccountComponent } from './crud/account.component';

const routes: Routes = [
  {
    path: 'accounts',
    component: ListAccountsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'accounts/add',
    component: AccountComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'accounts/view/:id',
    component: AccountComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'accounts/update/:id',
    component: AccountComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'accounts/delete/:id',
    component: AccountComponent,
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
    AccountComponent,
    ListAccountsComponent
  ],
  exports: [
    AccountComponent
  ],
  entryComponents: [
    AccountComponent
  ],
  providers: [
    AccountService
  ]
})

export class AccountModule { }
