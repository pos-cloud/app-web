import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Category } from './../../models/category';
import { CategoryService } from './../../services/category.service';

import { AddCategoryComponent } from './../../components/add-category/add-category.component';
import { UpdateCategoryComponent } from './../../components/update-category/update-category.component';
import { DeleteCategoryComponent } from './../../components/delete-category/delete-category.component';
import { ImportComponent } from './../../components/import/import.component';

import { Config } from './../../app.config';

@Component({
  selector: 'app-list-categories',
  templateUrl: './list-categories.component.html',
  styleUrls: ['./list-categories.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListCategoriesComponent implements OnInit {

  public categories: Category[] = new Array();
  public areCategoriesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  @Output() eventAddItem: EventEmitter<Category> = new EventEmitter<Category>();
  @Output() eventSelectCategory: EventEmitter<Category> = new EventEmitter<Category>();
  @Input() areCategoriesVisible: boolean = true;
  public apiURL = Config.apiURL;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public database: string;
  constructor(
    public _categoryService: CategoryService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    this.database = Config.database;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if (this.userType !== "pos") {
      this.orderTerm = ['description'];
    } else {
      this.orderTerm = ['order'];
    }
    this.getCategories();
  }

  public getBadge(term: string): boolean {

    return true;
  }

  public getCategories(): void {

    this.loading = true;

    let query = 'sort="description":1';

    this._categoryService.getCategories(query).subscribe(
      result => {
        if (!result.categories) {
          if (this.userType !== "pos") {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          }
          this.loading = false;
          this.categories = new Array();
          this.areCategoriesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.categories = result.categories;
          this.totalItems = this.categories.length;
          this.areCategoriesEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getCategories();
  }

  public openModal(op: string, category:Category): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(UpdateCategoryComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.category = category;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add' :
        modalRef = this._modalService.open(AddCategoryComponent, { size: 'lg' }).result.then((result) => {
          this.getCategories();
        }, (reason) => {
          this.getCategories();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(UpdateCategoryComponent, { size: 'lg', backdrop: 'static' });
          modalRef.componentInstance.category = category;
          modalRef.result.then((result) => {
            this.getCategories();
          }, (reason) => {
            this.getCategories();
          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(DeleteCategoryComponent, { size: 'lg' })
          modalRef.componentInstance.category = category;
          modalRef.componentInstance.readonly = false;
          modalRef.result.then((result) => {
            if (result === 'delete_close') {
              this.getCategories();
            }
          }, (reason) => {

          });
          break;
      case 'import':
        modalRef = this._modalService.open(ImportComponent, { size: 'lg', backdrop: 'static' });
        let model: any = new Category();
        model.model = "category";
        model.primaryKey = "description";
        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          if (result === 'import_close') {
            this.getCategories();
          }
        }, (reason) => {

        });
        break;
      default : ;
    }
  };

  public addItem(categorySelected) {
    this.eventAddItem.emit(categorySelected);
  }

  public selectCategory(categorySelected) {
    this.eventSelectCategory.emit(categorySelected);
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
