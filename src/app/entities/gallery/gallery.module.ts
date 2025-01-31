import { NgModule } from '@angular/core';
import { EntitiesModule } from '../entities.module';
import { GalleryComponent } from './crud/gallery.component';
import { GalleryRoutingModule } from './gallery-routing.module';
import { ListGalleriesComponent } from './list-galleries/list-galleries.component';
import { ViewGalleryComponent } from './view-gallery/view-gallery.component';

@NgModule({
  declarations: [GalleryComponent, ListGalleriesComponent, ViewGalleryComponent],
  imports: [EntitiesModule, GalleryRoutingModule],
  providers: [],
})
export class GalleryModule {}
