import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Category } from './../../models/category';
import { CategoryService } from './../../services/category.service';

import { AddCategoryComponent } from './../../components/add-category/add-category.component';
import { UpdateCategoryComponent } from './../../components/update-category/update-category.component';
import { DeleteCategoryComponent } from './../../components/delete-category/delete-category.component';

@Component({
  selector: 'app-list-categories',
  templateUrl: './list-categories.component.html',
  styleUrls: ['./list-categories.component.css'],
  providers: [NgbAlertConfig]
})

export class ListCategoriesComponent implements OnInit {

  public categories: Category[] = new Array();
  public areCategoriesEmpty: boolean = true;
  public alertMessage: any;
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  @Output() eventAddItem: EventEmitter<Category> = new EventEmitter<Category>();
  @Output() eventSelectCategory: EventEmitter<Category> = new EventEmitter<Category>();
  @Input() areCategoriesVisible: boolean = true;

  constructor(
    public _categoryService: CategoryService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCategories();
  }

  public getBadge(term: string): boolean {

    return true;
  }

  public getCategories(): void {  

    this._categoryService.getCategories().subscribe(
        result => {
          if(!result.categories) {
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
            this.categories = null;
            this.areCategoriesEmpty = true;
          } else {
            this.alertMessage = null;
            this.categories = result.categories;
            this.areCategoriesEmpty = false;
          }
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
            this.alertMessage = "Error en la petición.";
          }
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
  
  public openModal(op: string, category:Category): void {

      let modalRef;
      switch(op) {
        case 'add' :
          modalRef = this._modalService.open(AddCategoryComponent, { size: 'lg' }).result.then((result) => {
            this.getCategories();
          }, (reason) => {
            this.getCategories();
          });
          break;
        case 'update' :
            modalRef = this._modalService.open(UpdateCategoryComponent, { size: 'lg' })
            modalRef.componentInstance.category = category;
            modalRef.result.then((result) => {
              if(result === 'save_close') {
                this.getCategories();
              }
            }, (reason) => {
              
            });
          break;
        case 'delete' :
            modalRef = this._modalService.open(DeleteCategoryComponent, { size: 'lg' })
            modalRef.componentInstance.category = category;
            modalRef.result.then((result) => {
              if(result === 'delete_close') {
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
}
