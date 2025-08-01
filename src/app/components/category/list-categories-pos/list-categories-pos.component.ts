import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { TransactionMovement } from 'app/components/transaction-type/transaction-type';

import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../category';

@Component({
  selector: 'app-list-categories-pos',
  templateUrl: './list-categories-pos.component.html',
  styleUrls: ['./list-categories-pos.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListCategoriesPosComponent implements OnInit, OnChanges {
  @Output() eventAddItem: EventEmitter<Category> = new EventEmitter<Category>();
  @Output() eventSelectCategory: EventEmitter<Category> = new EventEmitter<Category>();
  @Input() areCategoriesVisible: boolean = true;
  @Input() transactionMovement: TransactionMovement;
  @Input() loading: boolean = true;
  categories: Category[] = [];
  categoryFiltered: Category[] = [];
  areCategoriesEmpty: boolean = true;
  orderTerm: string[] = ['order'];
  propertyTerm: string;
  areFiltersVisible: boolean = false;

  constructor(private _categoryService: CategoryService) {}

  ngOnInit(): void {
    // Solo cargar categorías si ya tenemos el TransactionMovement
    if (this.transactionMovement) {
      this.getCategories();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia el TransactionMovement y no se han cargado las categorías, cargarlas
    if (
      changes['transactionMovement'] &&
      changes['transactionMovement'].currentValue &&
      !changes['transactionMovement'].firstChange &&
      this.categories.length === 0
    ) {
      this.getCategories();
    }
  }

  public getCategories(): void {
    this.loading = true;
    // Limpiar el filtro al cargar nuevas categorías
    this.categoryFiltered = [];
    this.areCategoriesEmpty = true;

    let match = {};

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
          if (result.result.length > 0) {
            this.categories = result.result;
            // Filtrar solo las categorías principales (sin parent)
            this.filterMainCategories();
          } else {
            this.categories = [];
            this.categoryFiltered = [];
            this.areCategoriesEmpty = true;
          }
          // Solo desactivar loading después de que todo esté listo
          this.loading = false;
        },
        (error) => {
          this.categories = [];
          this.categoryFiltered = [];
          this.areCategoriesEmpty = true;
          this.loading = false;
        }
      );
  }

  /**
   * Filtra las categorías principales (sin parent)
   */
  private filterMainCategories(): void {
    this.categoryFiltered = this.categories.filter((cat) => !cat.parent);
    this.areCategoriesEmpty = this.categoryFiltered.length === 0;
  }

  /**
   * Resetea el filtro para mostrar las categorías principales
   */
  public resetToMainCategories(): void {
    this.filterMainCategories();
  }

  /**
   * Fuerza la carga de categorías (para cuando el TransactionMovement esté disponible)
   */
  public loadCategories(): void {
    if (this.transactionMovement && this.categories.length === 0) {
      this.getCategories();
    }
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

  public onImageError(event: any): void {
    // Cuando la imagen no se puede cargar, cambiar a la imagen por defecto
    event.target.src = './../../../assets/img/default.jpg';
  }
}
