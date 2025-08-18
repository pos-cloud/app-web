import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { TypeaheadDropdownComponent } from '@shared/components/typehead-dropdown/typeahead-dropdown.component';
import { ApiResponse, Article, Category, Make, PriceList } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArticleService } from '../../../../core/services/article.service';
import { CategoryService } from '../../../../core/services/category.service';
import { MakeService } from '../../../../core/services/make.service';
import { PriceListService } from '../../../../core/services/price-list.service';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PipesModule,
    TranslateModule,
    TypeaheadDropdownComponent,
    ProgressbarModule,
  ],
})
export class PriceListComponent implements OnInit {
  public priceListId: string;
  public operation: string;
  public priceList: PriceList;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public priceListForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();
  public articles: Article[] = [];
  public categories: Category[] = [];
  public makes: Make[] = [];

  constructor(
    public _priceListService: PriceListService,
    public _articleService: ArticleService,
    public _categoryService: CategoryService,
    public _makeService: MakeService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    private _route: ActivatedRoute,
    private _toastService: ToastService
  ) {
    this.priceListForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      percentageType: ['final', [Validators.required]], // Nuevo campo
      allowSpecialRules: [false, []],
      default: [false, [Validators.required]],
      rules: this._fb.array([]),
      exceptions: this._fb.array([]),
    });
  }

  // Getter para acceder fácilmente al FormArray de rules
  get rulesArray(): UntypedFormArray {
    return this.priceListForm.get('rules') as UntypedFormArray;
  }

  // Getter para acceder fácilmente al FormArray de exceptions
  get exceptionsArray(): UntypedFormArray {
    return this.priceListForm.get('exceptions') as UntypedFormArray;
  }

  // Método para crear un FormGroup para una regla
  private createRuleFormGroup(): UntypedFormGroup {
    return this._fb.group({
      _id: [null, []],
      category: [null, []],
      make: [null, []],
      percentage: [0, [Validators.min(0), Validators.max(100)]],
    });
  }

  // Método para crear un FormGroup para una excepción
  private createExceptionFormGroup(): UntypedFormGroup {
    return this._fb.group({
      _id: [null, []],
      article: [null, []],
      percentage: [0, [Validators.min(0), Validators.max(100)]],
    });
  }

  // Método para agregar una nueva regla
  public addRule(): void {
    this.rulesArray.push(this.createRuleFormGroup());
  }

  // Método para eliminar una regla
  public removeRule(index: number): void {
    this.rulesArray.removeAt(index);
  }

  // Método para agregar una nueva excepción
  public addException(): void {
    this.exceptionsArray.push(this.createExceptionFormGroup());
  }

  // Método para eliminar una excepción
  public removeException(index: number): void {
    this.exceptionsArray.removeAt(index);
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const priceListId = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') {
      this.priceListForm.disable();
    }

    this.loading = true;

    combineLatest({
      articles: this._articleService.find({ query: { operationType: { $ne: 'D' } } }),
      categories: this._categoryService.find({ query: { operationType: { $ne: 'D' } } }),
      makes: this._makeService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ articles, categories, makes }) => {
          this.articles = articles || [];
          this.categories = categories || [];
          this.makes = makes || [];

          if (priceListId) {
            this.getPriceList(priceListId);
          } else {
            this.setValueForm();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getPriceList(id: string) {
    this.loading = true;
    this._priceListService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse) => {
          if (response.status === 200) {
            this.priceList = response.result;
            this.setValueForm();
          } else {
            this._toastService.showToast(response.message);
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  private setValueForm() {
    if (this.priceList) {
      // Limpiar arrays existentes
      while (this.rulesArray.length !== 0) {
        this.rulesArray.removeAt(0);
      }
      while (this.exceptionsArray.length !== 0) {
        this.exceptionsArray.removeAt(0);
      }

      // Agregar reglas
      if (this.priceList.rules && this.priceList.rules.length > 0) {
        this.priceList.rules.forEach((rule) => {
          // Buscar la categoría y marca completas por ID
          const categoryId = typeof rule.category === 'string' ? rule.category : rule.category?._id;
          const makeId = typeof rule.make === 'string' ? rule.make : rule.make?._id;
          const categoryObj = categoryId ? this.categories.find((cat) => cat._id === categoryId) : null;
          const makeObj = makeId ? this.makes.find((make) => make._id === makeId) : null;

          this.rulesArray.push(
            this._fb.group({
              _id: [rule._id || null, []],
              category: [categoryObj || null, []],
              make: [makeObj || null, []],
              percentage: [rule.percentage, [Validators.min(0), Validators.max(100)]],
            })
          );
        });
      }

      // Agregar excepciones
      if (this.priceList.exceptions && this.priceList.exceptions.length > 0) {
        this.priceList.exceptions.forEach((exception) => {
          // Buscar el artículo completo por ID
          const articleId = typeof exception.article === 'string' ? exception.article : exception.article?._id;
          const articleObj = articleId ? this.articles.find((art) => art._id === articleId) : null;
          this.exceptionsArray.push(
            this._fb.group({
              _id: [exception._id || null, []],
              article: [articleObj || null, []],
              percentage: [exception.percentage, [Validators.min(0), Validators.max(100)]],
            })
          );
        });
      }

      this.priceListForm.patchValue({
        _id: this.priceList._id || '',
        name: this.priceList.name || '',
        percentage: this.priceList.percentage || 0,
        percentageType: this.priceList.percentageType || 'base', // Nuevo campo
        allowSpecialRules: this.priceList.allowSpecialRules || false,
        default: this.priceList.default || false,
      });
    } else {
      // Valores por defecto para nuevo registro
      this.priceListForm.patchValue({
        _id: '',
        name: '',
        percentage: 0,
        percentageType: 'base', // Nuevo campo
        allowSpecialRules: false,
        default: false,
      });
    }
  }

  public handlePriceListOperation() {
    this.loading = true;
    this.priceListForm.markAllAsTouched();

    if (this.priceListForm.invalid) {
      this.loading = false;
      return;
    }

    const formValue = this.priceListForm.value;

    console.log('Form Value:', formValue);
    console.log('Rules:', formValue.rules);
    console.log('Exceptions:', formValue.exceptions);
    console.log('this.priceList:', this.priceList);

    // Preparar el objeto priceList con las reglas y excepciones
    const priceListData: PriceList = {
      ...this.priceList, // Mantener todos los campos existentes
      _id: this.priceList?._id || formValue._id,
      name: formValue.name,
      percentage: formValue.percentage,
      percentageType: formValue.percentageType, // Nuevo campo
      allowSpecialRules: formValue.allowSpecialRules,
      default: formValue.default,
      rules: formValue.rules.map((rule) => {
        // La interfaz permite Category | string, así que manejamos ambos casos
        const categoryObj =
          typeof rule.category === 'string'
            ? this.categories.find((cat) => cat._id === rule.category) || null
            : rule.category;

        // La interfaz permite Make | string, así que manejamos ambos casos
        const makeObj =
          typeof rule.make === 'string' ? this.makes.find((make) => make._id === rule.make) || null : rule.make;

        return {
          _id: rule._id || null,
          category: categoryObj,
          make: makeObj,
          percentage: rule.percentage || 0,
        };
      }),
      exceptions: formValue.exceptions.map((exception) => {
        // La interfaz permite Article | string, así que manejamos ambos casos
        const articleObj =
          typeof exception.article === 'string'
            ? this.articles.find((art) => art._id === exception.article) || null
            : exception.article;

        return {
          _id: exception._id || null,
          article: articleObj,
          percentage: exception.percentage || 0,
        };
      }),
    };

    console.log('Final Data:', priceListData);

    switch (this.operation) {
      case 'add':
        this.savePriceList(priceListData);
        break;
      case 'update':
        this.updatePriceList(priceListData);
        break;
      case 'delete':
        this.deletePriceList();
        break;
      default:
        break;
    }
  }

  public savePriceList(priceList: PriceList) {
    this._priceListService
      .save(priceList)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse) => {
          if (response.status === 200) {
            this.returnTo();
          }
          this._toastService.showToast(response.message);
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public updatePriceList(priceList: PriceList) {
    this._priceListService
      .update(priceList)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse) => {
          if (response.status === 200) {
            this.returnTo();
          }
          this._toastService.showToast(response);
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public deletePriceList() {
    this._priceListService
      .delete(this.priceList._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse) => {
          if (response.status === 200) {
            this.returnTo();
          }
          this._toastService.showToast(response);
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public returnTo() {
    this._router.navigateByUrl('entities/price-list');
  }
}
