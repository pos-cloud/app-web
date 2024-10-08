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
  declarations: [
    GalleryComponent,
    ListGalleriesComponent,
    ViewGalleryComponent,
  ],
  exports: [GalleryComponent, ListGalleriesComponent, ViewGalleryComponent],
  providers: [GalleryService],
})
export class GalleryModule {}
