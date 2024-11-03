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
import { DatatableModule } from '../datatable/datatable.module';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { CashBoxTypeService } from './cash-box-type.service';
import { CashBoxTypeComponent } from './crud/cash-box-type.component';
import { ListCashBoxTypesComponent } from './list-cash-box-types/list-cash-box-types.component';

const routes: Routes = [
  {
    path: 'cash-box-types',
    component: ListCashBoxTypesComponent,
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
  declarations: [ListCashBoxTypesComponent, CashBoxTypeComponent],
  exports: [CashBoxTypeComponent],
  providers: [CashBoxTypeService],
})
export class CashBoxTypeModule {}
