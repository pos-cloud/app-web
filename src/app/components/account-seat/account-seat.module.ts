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
import { ListAccountSeatsComponent } from './list-account-seats/list-account-seats.component';
import { AccountSeatService } from './account-seat.service';
import { AccountSeatComponent } from './crud/account-seat.component';

const routes: Routes = [
  {
    path: 'account-seats',
    component: ListAccountSeatsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'account-seats/add',
    component: AccountSeatComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'account-seats/view/:id',
    component: AccountSeatComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'account-seats/update/:id',
    component: AccountSeatComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'account-seats/delete/:id',
    component: AccountSeatComponent,
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
    AccountSeatComponent,
    ListAccountSeatsComponent
  ],
  exports: [
    AccountSeatComponent
  ],
  entryComponents: [
    AccountSeatComponent
  ],
  providers: [
    AccountSeatService
  ]
})

export class AccountSeatModule { }
