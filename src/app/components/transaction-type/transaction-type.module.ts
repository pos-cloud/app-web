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
import { ListTransactionTypesComponent } from './list-transaction-types/list-transaction-types.component';
import { TransactionTypeService } from './transaction-type.service';
import { TransactionTypeComponent } from './crud/transaction-type.component';

const routes: Routes = [
  {
    path: 'transaction-types',
    component: ListTransactionTypesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'transaction-types/add',
    component: TransactionTypeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'transaction-types/view/:id',
    component: TransactionTypeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'transaction-types/update/:id',
    component: TransactionTypeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'transaction-types/delete/:id',
    component: TransactionTypeComponent,
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
        TransactionTypeComponent,
        ListTransactionTypesComponent
    ],
    exports: [
        TransactionTypeComponent
    ],
    providers: [
        TransactionTypeService
    ]
})

export class TransactionTypeModule { }
