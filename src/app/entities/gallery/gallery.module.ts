import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { PipesModule } from 'app/core/pipes/pipes.module';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { ResourceService } from '../resource/resource.service';
import { GalleryComponent } from './crud/gallery.component';
import { GalleryRoutingModule } from './gallery-routing.module';
import { GalleryService } from './gallery.service';
import { ListGalleriesComponent } from './list-galleries/list-galleries.component';
import { ViewGalleryComponent } from './view-gallery/view-gallery.component';

@NgModule({
  declarations: [
    GalleryComponent,
    ListGalleriesComponent,
    ViewGalleryComponent,
  ],
  imports: [
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
    GalleryRoutingModule,
  ],
  providers: [GalleryService, ResourceService],
})
export class GalleryModule {}
