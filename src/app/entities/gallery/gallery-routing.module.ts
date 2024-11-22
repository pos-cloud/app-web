import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { GalleryComponent } from './crud/gallery.component';
import { ListGalleriesComponent } from './list-galleries/list-galleries.component';
import { ViewGalleryComponent } from './view-gallery/view-gallery.component';

const routes: Routes = [
  {
    path: '',
    component: ListGalleriesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add',
    component: GalleryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view/:id',
    component: ViewGalleryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update/:id',
    component: GalleryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'delete/:id',
    component: GalleryComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GalleryRoutingModule {}
