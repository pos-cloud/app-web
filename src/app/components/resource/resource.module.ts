import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  NgbCarouselModule,
  NgbDropdownModule,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NguCarouselModule } from '@ngu/carousel';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from 'app/main/directives/directives.module';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { LicenseGuard } from 'app/main/guards/license.guard';
import { PipesModule } from 'app/main/pipes/pipes.module';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { NgxTinymceModule } from 'ngx-tinymce';
import { DatatableModule } from '../datatable/datatable.module';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { ResourceComponent } from './crud/resource.component';
import { ListResourcesComponent } from './list-resources/list-resources.component';
import { ResourceService } from './resource.service';

const routes: Routes = [
  {
    path: 'admin/resource',
    component: ListResourcesComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/resource/add',
    component: ResourceComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/resource/view/:id',
    component: ResourceComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/resource/update/:id',
    component: ResourceComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/resource/delete/:id',
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
    DirectivesModule,
    DragDropModule,
    ProgressbarModule,
    PipesModule,
    TranslateModule,
    NgbDropdownModule,
    NgbModule,
    DatatableModule,
    NgxTinymceModule,
    NgbCarouselModule,
    NguCarouselModule,
  ],
  declarations: [ResourceComponent, ListResourcesComponent],
  exports: [ResourceComponent, ListResourcesComponent],
  providers: [ResourceService],
})
export class ResourceModule {}
