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
import { CompanyGroupComponent } from './crud/company-group.component';
import { ListCompaniesGroupComponent } from './list-companies-group/list-companies-group.component';

const routes: Routes = [
  {
    path: 'company-groups',
    component: ListCompaniesGroupComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'company-groups/add',
    component: CompanyGroupComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'company-groups/view/:id',
    component: CompanyGroupComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'company-groups/update/:id',
    component: CompanyGroupComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'company-groups/delete/:id',
    component: CompanyGroupComponent,
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
  declarations: [ListCompaniesGroupComponent, CompanyGroupComponent],
  exports: [CompanyGroupComponent],
  providers: [],
})
export class CompanyGroupModule {}
