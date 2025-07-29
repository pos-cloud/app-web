import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionMovement } from 'app/components/transaction-type/transaction-type';

import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../category';

@Component({
  selector: 'app-list-categories-pos',
  templateUrl: './list-categories-pos.component.html',
  styleUrls: ['./list-categories-pos.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class ListCategoriesPosComponent implements OnInit {
  @Output() eventAddItem: EventEmitter<Category> = new EventEmitter<Category>();
  @Output() eventSelectCategory: EventEmitter<Category> = new EventEmitter<Category>();
  @Input() areCategoriesVisible: boolean = true;
  @Input() transactionMovement: TransactionMovement;
  @Input() loading: boolean = false;
  categories: Category[] = [];
  categoryFiltered: Category[] = [];
  areCategoriesEmpty: boolean = true;
  alertMessage: string = '';
  userType: string;
  orderTerm: string[] = ['order'];
  propertyTerm: string;
  areFiltersVisible: boolean = false;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    public _categoryService: CategoryService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {}

  ngOnInit(): void {
    this.getCategories();
  }

  public getCategories(): void {
    this.loading = true;

    let match = {};

    match['operationType'] = { $ne: 'D' };

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      order: 1,
      description: 1,
      picture: 1,
      visibleOnSale: 1,
      visibleOnPurchase: 1,
      'parent._id': 1,
      'parent.description': 1,
      'parent.picture': 1,
      'parent.operationType': 1,
      operationType: 1,
    };

    if (this.transactionMovement === TransactionMovement.Sale) {
      match['visibleOnSale'] = true;
    }

    if (this.transactionMovement === TransactionMovement.Purchase) {
      match['visibleOnPurchase'] = true;
    }

    match['operationType'] = { $ne: 'D' };
    match['parent.operationType'] = { $ne: 'D' };

    this._categoryService
      .getAll({
        project, // PROJECT
        match, // MATCH
        sort: { order: 1, description: 1 },
      })
      .subscribe(
        (result) => {
          this.loading = false;
          if (result.result.length > 0) {
            this.categories = result.result;
            this.categoryFiltered = this.categories.filter((cat) => !cat.parent);
          } else {
            this.categories = [];
            this.categoryFiltered = [];
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

  public addItem(categorySelected) {
    this.eventAddItem.emit(categorySelected);
  }

  public selectCategory(categorySelected) {
    // Filtrar en memoria las subcategorías cuyo parent sea la seleccionada
    const subcategories = this.categories.filter((cat) => {
      if (cat.parent && typeof cat.parent === 'object' && cat.parent._id) {
        return cat.parent._id === categorySelected._id;
      } else if (cat.parent) {
        return cat.parent === categorySelected._id;
      }
      return false;
    });
    if (subcategories.length > 0) {
      // Mostrar subcategorías
      this.categoryFiltered = subcategories;
    } else {
      // No hay subcategorías, emitir evento para mostrar productos
      this.eventSelectCategory.emit(categorySelected);
    }
  }

  // Eliminada la función getCategoriesChild, ahora todo se filtra en memoria

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
