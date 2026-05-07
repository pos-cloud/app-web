import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ArticleService } from 'app/core/services/article.service';
import { CategoryService } from 'app/core/services/category.service';
import { Article } from 'app/components/article/article';
import { Category } from '@types';

@Injectable({
  providedIn: 'root',
})
export class PosArticlesDataService {
  constructor(
    private readonly _articleService: ArticleService,
    private readonly _categoryService: CategoryService
  ) {}

  getCategoriesByTransaction(transactionId: string): Observable<Category[]> {
    return this._categoryService.getCategoriesByTransaction(transactionId).pipe(
      map((res: any) => {
        const rows = (res?.result ?? res ?? []) as Category[];
        return Array.isArray(rows) ? rows : [];
      })
    );
  }

  getArticles(input: {
    transactionId: string;
    categoryId?: string;
    q?: string;
    limit?: number;
    skip?: number;
  }): Observable<{ articles: Article[]; hasMore: boolean }> {
    return this._articleService.getArticlesByTransaction({
      transactionId: input.transactionId,
      categoryId: input.categoryId,
      q: input.q,
      limit: input.limit,
      skip: input.skip,
    });
  }
}

