import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { GalleryService } from '@core/services/gallery.service';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Gallery, Resource } from '@types';
import { Article } from 'app/components/article/article';
import { PaymentMethod } from 'app/components/payment-method/payment-method';
import { ArticleService } from 'app/core/services/article.service';
import { PaymentMethodService } from 'app/core/services/payment-method.service';
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
  public carouselBanner;
  public intervalSocket;
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
    private _articleService: ArticleService,
    private _resourceService: ResourceService,
    private _toastr: ToastService,
    private _paymentMethod: PaymentMethodService
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
      this._articleService
        .getAll({
          project: {
            code: 1,
            barcode: 1,
            description: 1,
            'make.description': 1,
            'make.picture': 1,
            'category.description': 1,
            posDescription: 1,
            observation: 1,
            salePrice: 1,
            operationType: 1,
            picture: 1,
          },
          match: {
            $or: [{ barcode: this.filterArticle }, { code: this.filterArticle }],
            operationType: { $ne: 'D' },
          },
        })
        .subscribe(
          (result) => {
            if (result.result.length > 0) {
              this.article = result.result[0];
              this.filterArticle = '';
              this.getPaymentMethods();
            } else {
              this.article = null;
              this.filterArticle = '';
            }

            if (this.article !== null) {
              if (this.article.picture === './../../../assets/img/default.jpg' || !this.article.picture) {
                this.articleImage = null;
                if (this.article.make && this.article.make.picture) {
                  this.makeImage = this.article.make.picture;
                } else {
                  this.articleImage = null;
                }
              } else {
                this.articleImage = this.article.picture;
              }
            }
          },
          (error) => {
            this.article = null;
            this.filterArticle = '';
          }
        );
    } else {
      this.article = null;
      this.filterArticle = '';
    }
  }

  public getPaymentMethods() {
    this.loading = true;
    let project = {
      _id: 1,
      name: 1,
      operationType: 1,
    };
    let match = {
      operationType: { $ne: 'D' },
    };
    this._paymentMethod.getAll({ project, match }).subscribe(
      (result) => {
        if (!result.result) {
          this._toastr.showToast(result);
        } else {
          this.paymentMethod = result.result;
        }
        this.loading = false;
      },
      (error) => {
        this._toastr.showToast(error);
        this.loading = false;
      }
    );
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
