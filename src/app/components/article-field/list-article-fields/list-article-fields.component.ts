import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ArticleFieldService } from '../../../core/services/article-field.service';
import { ArticleField } from '../article-field';

import { AddArticleFieldComponent } from '../article-field/add-article-field.component';
import { DeleteArticleFieldComponent } from '../delete-article-field/delete-article-field.component';
import { UpdateArticleFieldComponent } from '../update-article-field/update-article-field.component';

@Component({
  selector: 'app-list-article-fields',
  templateUrl: './list-article-fields.component.html',
  styleUrls: ['./list-article-fields.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class ListArticleFieldsComponent implements OnInit {
  public articleFields: ArticleField[] = new Array();
  public areArticleFieldsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['order'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<ArticleField> =
    new EventEmitter<ArticleField>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _articleFieldService: ArticleFieldService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {}

  ngOnInit(): void {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getArticleFields();
  }

  public getArticleFields(): void {
    this.loading = true;

    this._articleFieldService.getArticleFields().subscribe(
      (result) => {
        if (!result.articleFields) {
          if (result.message && result.message !== '')
            this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.articleFields = new Array();
          this.areArticleFieldsEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.articleFields = result.articleFields;
          this.totalItems = this.articleFields.length;
          this.areArticleFieldsEmpty = false;
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy(term: string, property?: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getArticleFields();
  }

  public openModal(op: string, articleField: ArticleField): void {
    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(UpdateArticleFieldComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.articleField = articleField;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add':
        modalRef = this._modalService
          .open(AddArticleFieldComponent, { size: 'lg', backdrop: 'static' })
          .result.then(
            (result) => {
              this.getArticleFields();
            },
            (reason) => {
              this.getArticleFields();
            }
          );
        break;
      case 'update':
        modalRef = this._modalService.open(UpdateArticleFieldComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.articleField = articleField;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then(
          (result) => {
            this.getArticleFields();
          },
          (reason) => {
            this.getArticleFields();
          }
        );
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteArticleFieldComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.articleField = articleField;
        modalRef.result.then(
          (result) => {
            if (result === 'delete_close') {
              this.getArticleFields();
            }
          },
          (reason) => {}
        );
        break;
      default:
    }
  }

  public addItem(articleFieldSelected) {
    this.eventAddItem.emit(articleFieldSelected);
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
