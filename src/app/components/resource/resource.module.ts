import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { LicenseGuard } from 'app/core/guards/license.guard';
import { PipesModule } from 'app/core/pipes/pipes.module';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { NgxTinymceModule } from 'ngx-tinymce';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { DatatableModule } from '../datatable/datatable.module';
import { ResourceComponent } from './crud/resource.component';
import { ListResourcesComponent } from './list-resources/list-resources.component';
import { ResourceService } from './resource.service';

const routes: Routes = [
  {
    path: 'admin/resources',
    component: ListResourcesComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/resources/add',
    component: ResourceComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/resources/view/:id',
    component: ResourceComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/resources/update/:id',
    component: ResourceComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/resources/delete/:id',
    component: ResourceComponent,
    canActivate: [AuthGuard, LicenseGuard],
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
  declarations: [ResourceComponent, ListResourcesComponent],
  exports: [ResourceComponent, ListResourcesComponent],
  providers: [ResourceService],
})
export class ResourceModule {}
