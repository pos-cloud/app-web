import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CashBoxTypeComponent } from './crud/cash-box-type.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import { CashBoxTypeService } from './cash-box-type.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule } from '../datatable/datatable.module';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/main/pipes/pipes.module';
import { ListCashBoxTypesComponent } from './list-cash-box-types/list-cash-box-types.component';

const routes: Routes = [
  {
    path: 'cash-box-types',
    component: ListCashBoxTypesComponent,
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
    DatatableModule
  ],
  declarations: [
    ListCashBoxTypesComponent,
    CashBoxTypeComponent
  ],
  exports: [
    CashBoxTypeComponent
  ],
  entryComponents: [
    CashBoxTypeComponent
  ],
  providers: [
    CashBoxTypeService
  ]
})

export class CashBoxTypeModule { }
