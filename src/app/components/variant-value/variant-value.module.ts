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
import { DatatableModule } from '../datatable/datatable.module';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { VariantValueComponent } from './crud/variant-value.component';
import { ListVariantValuesComponent } from './list-variant-values/list-variant-values.component';
import { VariantValueService } from './variant-value.service';

const routes: Routes = [
  {
    path: 'variant-values',
    component: ListVariantValuesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'variant-values/add',
    component: VariantValueComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'variant-values/view/:id',
    component: VariantValueComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'variant-values/update/:id',
    component: VariantValueComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'variant-values/delete/:id',
    component: VariantValueComponent,
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
    DragDropModule,
    ProgressbarModule,
    PipesModule,
    TranslateModule,
    NgbDropdownModule,
    NgbModule,
    DatatableModule,
    NgxTinymceModule,
    FocusDirective,
  ],
  declarations: [ListVariantValuesComponent, VariantValueComponent],
  exports: [VariantValueComponent],
  providers: [VariantValueService],
})
export class VariantValueModule {}
