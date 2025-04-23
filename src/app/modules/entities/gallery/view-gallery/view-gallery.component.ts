import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { GalleryService } from '@core/services/gallery.service';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Gallery, Resource } from '@types';
import { Article } from 'app/components/article/article';
import { PaymentMethod } from 'app/components/payment-method/payment-method';
import { ResourceService } from 'app/core/services/resource.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
@Component({
  selector: 'app-view-gallery',
  templateUrl: './view-gallery.component.html',
  styleUrls: ['./view-gallery.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbCarouselModule, FocusDirective],
})
export class ViewGalleryComponent implements OnInit {
  public src: string;
  public gallery: Gallery;
  public loading = false;
  public images = [];
  public viewBotton = true;
  public elem;
  public filterArticle: string;
  public article: Article = null;
  focusEvent = new EventEmitter<boolean>();
  public database: string;
  public resource: Resource[];
  public paymentMethod: PaymentMethod[];
  public makeImage: string = '';
  public articleImage: string = '';

  constructor(
    public _router: Router,
    private _galleryService: GalleryService,
    private _resourceService: ResourceService,
    private _toastr: ToastService
  ) {
    this.getResource();
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const galleryId = pathUrl[4];
    this.elem = document.documentElement;
    if (galleryId) {
      this.getGallery(galleryId);
    }
  }

  public getGallery(galleryId: string) {
    this.loading = true;

    this._galleryService.getById(galleryId).subscribe(
      (result) => {
        if (!result.result) {
          this._toastr.showToast(result);
        } else {
          this.gallery = result.result;
          if (this.gallery?.resources?.length > 0) {
            this.gallery.resources.forEach((element) => {
              let fileImg = this.resource.find((file) =>
                typeof element.resource === 'string' ? element.resource === file._id : element.resource._id === file._id
              );
              this.src = fileImg.file;
              this.images.push(this.src);
            });
          }

          if (this.gallery.barcode) {
            this.focusEvent.emit(true);
          }
        }
        this.loading = false;
      },
      (error) => {
        this._toastr.showToast(error);
        this.loading = false;
      }
    );
  }

  public getArticle(): void {
    if (this.filterArticle) {
      this._galleryService.findArticle(this.filterArticle).subscribe({
        next(value) {
          console.log(value);
        },
        error(err) {},
        complete() {},
      });
    } else {
      this.article = null;
      this.filterArticle = '';
    }
  }

  public openFullscreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }

    this.viewBotton = false;
  }

  public getResource() {
    this.loading = true;
    let project = {
      _id: 1,
      name: 1,
      file: 1,
      operationType: 1,
    };
    let match = {
      operationType: { $ne: 'D' },
    };
    this._resourceService.getAll({ project, match }).subscribe(
      (result) => {
        if (!result.result) {
          this._toastr.showToast(result);
        } else {
          this.resource = result.result;
        }
        this.loading = false;
      },
      (error) => {
        this._toastr.showToast(error);
        this.loading = false;
      }
    );
  }
}
