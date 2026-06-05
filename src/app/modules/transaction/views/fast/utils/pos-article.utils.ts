import { Article } from 'app/components/article/article';

export function posArticleHasVariants(article: Article | null | undefined): boolean {
  if (!article) return false;
  if (article.containsVariants === true) return true;
  return Array.isArray(article.variants) && article.variants.length > 0;
}

export function posArticleHasMeasure(article: Article | null | undefined): boolean {
  return !!article?.allowMeasure;
}
