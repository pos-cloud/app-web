import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { TypeaheadDropdownComponent } from '@shared/components/typehead-dropdown/typeahead-dropdown.component';
import { ApiResponse, Article, BusinessRule } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArticleService } from '../../../../core/services/article.service';
import { BusinessRuleService } from '../../../../core/services/business-rule.service';

@Component({
  selector: 'app-business-rule',
  templateUrl: './business-rule.component.html',
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
export class BusinessRuleComponent implements OnInit {
  public businessRuleId: string;
  public operation: string;
  public businessRule: BusinessRule;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public businessRuleForm: UntypedFormGroup;
  public formSubmitted = false;
  private destroy$ = new Subject<void>();
  public articles: Article[] = [];
  public days: { name: string; _id: string }[] = [
    { name: 'Lunes', _id: 'Monday' },
    { name: 'Martes', _id: 'Tuesday' },
    { name: 'Miércoles', _id: 'Wednesday' },
    { name: 'Jueves', _id: 'Thursday' },
    { name: 'Viernes', _id: 'Friday' },
    { name: 'Sábado', _id: 'Saturday' },
    { name: 'Domingo', _id: 'Sunday' },
  ];

  constructor(
    public _businessRuleService: BusinessRuleService,
    public _articleService: ArticleService,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public _router: Router,
    private _toastService: ToastService
  ) {
    this.businessRuleForm = this._fb.group({
      _id: ['', []],
      code: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      name: ['', [Validators.required]],
      startDate: ['', []],
      endDate: ['', []],
      totalStock: ['', [Validators.required, Validators.min(1)]],
      active: [true, [Validators.required]],
      discountType: ['', [Validators.required]],
      discountValue: ['', [Validators.required]],
      articleDiscount: ['', [Validators.required]],
      days: ['', []],
      articles: this._fb.array([]),
      articleGroups: this._fb.array([]),
      includeInApplyAll: [true, []],
    });
  }

  // Getter para acceder fácilmente al FormArray de articles
  get articlesArray(): UntypedFormArray {
    return this.businessRuleForm.get('articles') as UntypedFormArray;
  }

  // Getter para el FormArray de articleGroups
  get articleGroupsArray(): UntypedFormArray {
    return this.businessRuleForm.get('articleGroups') as UntypedFormArray;
  }

  // Método para crear un FormGroup para un article
  private createArticleFormGroup(): UntypedFormGroup {
    return this._fb.group({
      article: ['', [Validators.required]],
      quantity: ['', [Validators.required, Validators.min(1)]],
    });
  }

  // Método para agregar un nuevo article
  public addArticle(): void {
    this.articlesArray.push(this.createArticleFormGroup());
  }

  // Método para eliminar un article
  public removeArticle(index: number): void {
    this.articlesArray.removeAt(index);
  }

  // Crear FormGroup para un article group (artículos opcionales entre sí + cantidad)
  private createArticleGroupFormGroup(): UntypedFormGroup {
    return this._fb.group({
      articles: this._fb.array([this._fb.control(null, [Validators.required])]),
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  public addArticleGroup(): void {
    this.articleGroupsArray.push(this.createArticleGroupFormGroup());
  }

  public removeArticleGroup(index: number): void {
    this.articleGroupsArray.removeAt(index);
  }

  public getGroupArticlesArray(groupIndex: number): UntypedFormArray {
    return this.articleGroupsArray.at(groupIndex).get('articles') as UntypedFormArray;
  }

  public addArticleToGroup(groupIndex: number): void {
    this.getGroupArticlesArray(groupIndex).push(this._fb.control(null, [Validators.required]));
  }

  public removeArticleFromGroup(groupIndex: number, articleIndex: number): void {
    const arr = this.getGroupArticlesArray(groupIndex);
    if (arr.length > 1) arr.removeAt(articleIndex);
  }

  ngOnInit() {
    const URL = this._router.url.split('/');
    this.operation = URL[3];
    this.businessRuleId = URL[4];

    if (this.operation === 'view' || this.operation === 'delete') {
      this.businessRuleForm.disable();
    }

    this.loading = true;

    combineLatest({
      articles: this._articleService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ articles }) => {
          this.articles = articles ?? [];

          if (this.businessRuleId) {
            this.getBusinessRule(this.businessRuleId);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  public setValueForm(): void {
    const articleDiscount = this.articles?.find((item) => item._id === this.businessRule?.articleDiscount?.toString());

    const formatDate = (date: string | Date) => {
      if (!date) return '';
      if (typeof date === 'string') return date.substring(0, 10);
      // Si es Date, formatea a 'YYYY-MM-DD'
      return date.toISOString().substring(0, 10);
    };

    const values = {
      _id: this.businessRule?._id ?? '',
      code: this.businessRule?.code ?? '',
      name: this.businessRule?.name ?? '',
      startDate: formatDate(this.businessRule?.startDate),
      endDate: formatDate(this.businessRule?.endDate),
      totalStock: this.businessRule?.totalStock ?? '',
      active: this.businessRule?.active ?? true,
      discountType: this.businessRule?.discountType ?? '',
      discountValue: this.businessRule?.discountValue ?? '',
      articleDiscount: articleDiscount ?? null,
      days: this.businessRule?.days ?? [],
      includeInApplyAll: this.businessRule?.includeInApplyAll ?? true,
    };
    this.businessRuleForm.patchValue(values);

    // Manejar los articles
    if (this.businessRule?.articles && this.businessRule.articles.length > 0) {
      // Limpiar el FormArray existente
      while (this.articlesArray.length !== 0) {
        this.articlesArray.removeAt(0);
      }

      // Agregar cada article al FormArray
      this.businessRule.articles.forEach((articleItem) => {
        const article = this.articles?.find((item) => item._id === articleItem.article?.toString());
        this.articlesArray.push(
          this._fb.group({
            article: [article ?? null, [Validators.required]],
            quantity: [articleItem.quantity ?? 1, [Validators.required, Validators.min(1)]],
          })
        );
      });
    }

    // Cargar articleGroups
    if (this.businessRule?.articleGroups && this.businessRule.articleGroups.length > 0) {
      while (this.articleGroupsArray.length !== 0) {
        this.articleGroupsArray.removeAt(0);
      }
      this.businessRule.articleGroups.forEach((group) => {
        const articleIds = Array.isArray(group.articles)
          ? group.articles.map((a: any) => (typeof a === 'object' && a?._id ? a._id : a))
          : [];
        const articleControls = articleIds.length
          ? articleIds.map((id) =>
              this._fb.control(this.articles?.find((item) => item._id === id) ?? null, [Validators.required])
            )
          : [this._fb.control(null, [Validators.required])];
        this.articleGroupsArray.push(
          this._fb.group({
            articles: this._fb.array(articleControls),
            quantity: [group.quantity ?? 1, [Validators.required, Validators.min(1)]],
          })
        );
      });
    }
  }

  public returnTo() {
    this._router.navigateByUrl('entities/business-rules');
  }

  public getBusinessRule(id: string) {
    this.loading = true;

    this._businessRuleService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.businessRule = result.result;
          if (result.status == 200) this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public handleBusinessRuleOperation() {
    this.formSubmitted = true;
    this.loading = true;

    this.businessRuleForm.markAllAsTouched();
    if (this.businessRuleForm.invalid) {
      this.loading = false;
      return;
    }
    const formValue = this.businessRuleForm.value;
    const articleGroupsPayload = (formValue.articleGroups || []).map((group: any) => ({
      articles: (group.articles || []).map((a: any) => (a && typeof a === 'object' && a._id ? a._id : a)).filter(Boolean),
      quantity: group.quantity,
    }));
    this.businessRule = {
      ...this.businessRule,
      ...formValue,
      articleGroups: articleGroupsPayload,
    };

    switch (this.operation) {
      case 'add':
        this.saveBusinessRule();
        break;
      case 'update':
        this.updateBusinessRule();
        break;
      case 'delete':
        this.deleteBusinessRule();
        break;
      default:
        break;
    }
  }

  public updateBusinessRule() {
    this._businessRuleService
      .update(this.businessRule)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public saveBusinessRule() {
    this._businessRuleService
      .save(this.businessRule)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public deleteBusinessRule() {
    this._businessRuleService
      .delete(this.businessRule._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  // Métodos para selección múltiple de días con checkboxes
  toggleDay(dayId: string, checked: boolean) {
    const daysControl = this.businessRuleForm.get('days');
    let value = daysControl.value as string[];
    if (checked) {
      value = [...value, dayId];
    } else {
      value = value.filter((d) => d !== dayId);
    }
    daysControl.setValue(value);
    daysControl.markAsDirty();
  }

  mostrarDiasSeleccionados(): string {
    const seleccionados = this.businessRuleForm.get('days').value;
    return this.days
      .filter((d) => seleccionados.includes(d._id))
      .map((d) => d.name)
      .join(', ');
  }
}
