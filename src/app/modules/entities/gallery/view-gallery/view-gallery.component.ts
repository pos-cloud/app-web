import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { GalleryService } from '@core/services/gallery.service';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Article, Gallery, Resource } from '@types';
import { ResourceService } from 'app/core/services/resource.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
@Component({
  selector: 'app-view-gallery',
  templateUrl: './view-gallery.component.html',
  styleUrls: ['./view-gallery.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbCarouselModule],
})
export class ViewGalleryComponent implements OnInit {
  @ViewChild('barcodeInput') barcodeInput: ElementRef;

  public objectKeys = Object.keys;
  public gallery: Gallery;
  public images = [];
  public backgroundImage: string = null;
  public viewBotton = true;
  public elem;
  public filterArticle: string;
  public article: Article = null;
  public resource: Resource[];

  constructor(
    private _router: Router,
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

  public get isBackgroundLayout(): boolean {
    return !!this.backgroundImage;
  }

  public getGallery(galleryId: string) {
    this._galleryService.getById(galleryId).subscribe(
      (result) => {
        if (!result.result) {
          this._toastr.showToast(result);
        } else {
          this.gallery = result.result;
          this.resolveMedia();

          if (this.gallery.barcode) {
            setTimeout(() => {
              this.barcodeInput?.nativeElement?.focus();
            }, 100);
          }
        }
      },
      (error) => {
        this._toastr.showToast(error);
      }
    );
  }

  private resolveMedia() {
    if (!this.gallery || !this.resource) return;

    this.images = [];
    this.backgroundImage = null;

    const backgroundId =
      typeof this.gallery.background === 'string' ? this.gallery.background : this.gallery.background?._id;
    if (backgroundId) {
      const backgroundResource = this.resource.find((file) => file._id === backgroundId);
      this.backgroundImage = backgroundResource?.file ?? null;
    }

    if (this.backgroundImage || !this.gallery?.resources?.length) return;

    this.gallery.resources.forEach((element) => {
      const fileImg = this.resource.find((file) =>
        typeof element.resource === 'string' ? element.resource === file._id : element.resource._id === file._id
      );
      if (fileImg?.file) this.images.push(fileImg.file);
    });
  }

  public getArticle(): void {
    if (this.filterArticle) {
      this._galleryService.findArticle(this.filterArticle).subscribe({
        next: (value) => {
          this.article = value.result;
          this.filterArticle = '';
        },
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

    if (this.gallery.barcode) {
      setTimeout(() => {
        this.barcodeInput?.nativeElement?.focus();
      }, 100);
    }

    this.viewBotton = false;
  }

  public getResource() {
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
          this.resolveMedia();
        }
      },
      (error) => {
        this._toastr.showToast(error);
      }
    );
  }
}
