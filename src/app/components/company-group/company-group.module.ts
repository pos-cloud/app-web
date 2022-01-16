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
import { CompanyGroupService } from './company-group.service';
import { CompanyGroupComponent } from './crud/company-group.component';
import { ListCompaniesGroupComponent } from './list-companies-group/list-companies-group.component';

const routes: Routes = [
  {
    path: 'company-groups',
    component: ListCompaniesGroupComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'company-groups/add',
    component: CompanyGroupComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'company-groups/view/:id',
    component: CompanyGroupComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'company-groups/update/:id',
    component: CompanyGroupComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'company-groups/delete/:id',
    component: CompanyGroupComponent,
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
        ListCompaniesGroupComponent,
        CompanyGroupComponent
    ],
    exports: [
        CompanyGroupComponent
    ],
    providers: [
        CompanyGroupService
    ]
})

export class CompanyGroupModule { }