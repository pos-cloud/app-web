import { NgModule } from '@angular/core';

import { EntitiesModule } from '../entities.module';
import { CategoryRoutingModule } from './category-routing.module';
import { CategoryComponent } from './crud/category.component';
import { ListCategoriesComponent } from './list/list-categories.component';

@NgModule({
  declarations: [CategoryComponent, ListCategoriesComponent],
  imports: [CategoryRoutingModule, EntitiesModule],
})
export class CategoryModule {}
