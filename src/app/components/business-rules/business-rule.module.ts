import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {NgbDropdownModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {DirectivesModule} from 'app/main/directives/directives.module';
import {AuthGuard} from 'app/main/guards/auth.guard';
import {PipesModule} from 'app/main/pipes/pipes.module';
import {NgxPaginationModule} from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import {NgxTinymceModule} from 'ngx-tinymce';

import {DatatableModule} from '../datatable/datatable.module';
import {ProgressbarModule} from '../progressbar/progressbar.module';

import {BusinessRuleService} from './business-rule.service';
import {BusinessRuleComponent} from './crud/business-rule.component';
import {ListBusinessRulesComponent} from './list-business-rules/list-business-rules.component';

const routes: Routes = [
  {
    path: 'business-rules',
    component: ListBusinessRulesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'business-rule/add',
    component: BusinessRuleComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'business-rule/view/:id',
    component: BusinessRuleComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'business-rule/update/:id',
    component: BusinessRuleComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'business-rule/delete/:id',
    component: BusinessRuleComponent,
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
    DirectivesModule,
    DragDropModule,
    ProgressbarModule,
    PipesModule,
    TranslateModule,
    NgbDropdownModule,
    NgbModule,
    DatatableModule,
    NgxTinymceModule,
  ],
  declarations: [BusinessRuleComponent, ListBusinessRulesComponent],
  exports: [BusinessRuleComponent],
  providers: [BusinessRuleService],
})
export class BusinessRuleModule {}
