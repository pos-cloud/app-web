import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { TransactionTypeService } from '../../core/services/transaction-type.service';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { DatatableModule } from '../datatable/datatable.module';
import { TransactionTypeComponent } from './crud/transaction-type.component';
import { ListTransactionTypesComponent } from './list-transaction-types/list-transaction-types.component';

const routes: Routes = [
  {
    path: 'transaction-types',
    component: ListTransactionTypesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'transaction-types/add',
    component: TransactionTypeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'transaction-types/view/:id',
    component: TransactionTypeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'transaction-types/update/:id',
    component: TransactionTypeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'transaction-types/delete/:id',
    component: TransactionTypeComponent,
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
  ],
  declarations: [TransactionTypeComponent, ListTransactionTypesComponent],
  exports: [TransactionTypeComponent],
  providers: [TransactionTypeService],
})
export class TransactionTypeModule {}
