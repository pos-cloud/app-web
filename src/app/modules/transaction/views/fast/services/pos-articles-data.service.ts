import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ArticleService } from 'app/core/services/article.service';
import { CategoryService } from 'app/core/services/category.service';
import { Article } from 'app/components/article/article';
import { Category } from '@types';

export interface PosBrowseResult {
  categories: Category[];
  articles: Article[];
  showPrices: boolean;
  transactionMovement: string;
}

@Injectable({
  providedIn: 'root',
})
export class PosArticlesDataService {
  constructor(
    private readonly _articleService: ArticleService,
    private readonly _categoryService: CategoryService
  ) {}

  browse(input: {
    transactionId: string;
    parentId?: string;
    limit?: number;
  }): Observable<PosBrowseResult> {
    return this._categoryService
      .browseByTransaction(input.transactionId, {
        parentId: input.parentId,
        limit: input.limit,
      })
      .pipe(
        map((res: any) => {
          const r = res?.result ?? res ?? {};
          return {
            categories: (r.categories ?? []) as Category[],
            articles: (r.articles ?? []) as Article[],
            showPrices: !!r.showPrices,
            transactionMovement: String(r.transactionMovement ?? ''),
          };
        })
      );
  }

  getArticles(input: {
    transactionId: string;
    q?: string;
    limit?: number;
    skip?: number;
  }): Observable<{
    articles: Article[];
    hasMore: boolean;
    showPrices: boolean;
    transactionMovement: string;
  }> {
    return this._articleService.getArticlesByTransaction({
      transactionId: input.transactionId,
      q: input.q,
      limit: input.limit,
      skip: input.skip,
    });
  }
}
