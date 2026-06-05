import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Article } from 'app/components/article/article';
import { Variant } from 'app/components/variant/variant';
import { VariantService } from 'app/core/services/variant.service';
import { VariantType } from '@types';

@Component({
  selector: 'app-pos-article-variants-modal',
  templateUrl: './pos-article-variants-modal.component.html',
  styleUrls: ['./pos-article-variants-modal.component.scss'],
})
export class PosArticleVariantsModalComponent implements OnInit {
  @Input() article!: Article;

  loading = true;
  errorMessage = '';
  variants: Variant[] = [];
  variantTypes: VariantType[] = [];
  selectedByType: Record<string, string | null> = {};

  constructor(
    public activeModal: NgbActiveModal,
    private readonly _variantService: VariantService
  ) {}

  ngOnInit(): void {
    this.loadVariants();
  }

  get articleLabel(): string {
    return this.article?.posDescription || this.article?.description || this.article?.code || '';
  }

  get canConfirm(): boolean {
    if (!this.variantTypes.length) return false;
    return this.variantTypes.every((t) => {
      const key = t?.name;
      return key && this.selectedByType[key] != null && this.selectedByType[key] !== '';
    });
  }

  private loadVariants(): void {
    const parentId = this.article?._id;
    if (!parentId) {
      this.loading = false;
      this.errorMessage = 'Artículo inválido';
      return;
    }

    const query = `where="articleParent":"${parentId}"`;
    this._variantService.getVariants(query).subscribe({
      next: (result: any) => {
        this.loading = false;
        const list = result?.variants;
        if (!Array.isArray(list) || list.length === 0) {
          this.errorMessage = 'No hay variantes configuradas para este producto';
          return;
        }
        this.variants = list;
        this.variantTypes = this.uniqueTypes(list);
        this.initSelection();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudieron cargar las variantes';
      },
    });
  }

  private uniqueTypes(variants: Variant[]): VariantType[] {
    const map = new Map<string, VariantType>();
    for (const v of variants) {
      if (v?.type?.name && !map.has(v.type.name)) {
        map.set(v.type.name, v.type);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      String(a?.name ?? '').localeCompare(String(b?.name ?? ''))
    );
  }

  private initSelection(): void {
    for (const type of this.variantTypes) {
      const key = type.name;
      this.selectedByType[key] = null;
      const first = this.getVariantsForType(type)[0];
      if (first?.value?.description) {
        this.selectedByType[key] = first.value.description;
      }
    }
  }

  getVariantsForType(type: VariantType): Variant[] {
    return this.variants.filter((v) => v?.type?.name === type?.name);
  }

  selectValue(type: VariantType, description: string): void {
    if (!type?.name) return;
    this.selectedByType[type.name] = description;
  }

  isSelected(type: VariantType, description: string): boolean {
    return type?.name != null && this.selectedByType[type.name] === description;
  }

  private resolveChildArticle(): Article | null {
    const candidates: Article[] = [];

    for (const variant of this.variants) {
      const typeName = variant?.type?.name;
      const valueDesc = variant?.value?.description;
      if (!typeName || !valueDesc || !variant?.articleChild) continue;
      if (this.selectedByType[typeName] === valueDesc) {
        candidates.push(variant.articleChild);
      }
    }

    if (!candidates.length) return null;

    for (const article of candidates) {
      let count = 0;
      for (const other of candidates) {
        if (article._id === other._id) count++;
      }
      if (count === this.variantTypes.length) {
        return article;
      }
    }

    return candidates[0] ?? null;
  }

  confirm(): void {
    if (!this.canConfirm) return;
    const child = this.resolveChildArticle();
    if (!child?._id) {
      this.errorMessage = 'No se encontró el producto para esa combinación';
      return;
    }
    this.activeModal.close({
      articleId: child._id,
      quantity: 1,
      salePrice: Number(child.salePrice) || 0,
    });
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}
