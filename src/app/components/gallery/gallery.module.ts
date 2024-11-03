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
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { LicenseGuard } from 'app/core/guards/license.guard';
import { PipesModule } from 'app/core/pipes/pipes.module';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { NgxTinymceModule } from 'ngx-tinymce';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { DatatableModule } from '../datatable/datatable.module';
import { GalleryComponent } from './crud/gallery.component';
import { GalleryService } from './gallery.service';
import { ListGalleriesComponent } from './list-galleries/list-galleries.component';
import { ViewGalleryComponent } from './view-gallery/view-gallery.component';

const routes: Routes = [
  {
    path: 'admin/galleries',
    component: ListGalleriesComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/galleries/add',
    component: GalleryComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/view-galleries/:id',
    component: ViewGalleryComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/galleries/update/:id',
    component: GalleryComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/galleries/delete/:id',
    component: GalleryComponent,
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
    NgbCarouselModule,
  ],
  declarations: [
    GalleryComponent,
    ListGalleriesComponent,
    ViewGalleryComponent,
  ],
  exports: [GalleryComponent, ListGalleriesComponent, ViewGalleryComponent],
  providers: [GalleryService],
})
export class GalleryModule {}
