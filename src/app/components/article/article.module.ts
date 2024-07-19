import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule } from '../datatable/datatable.module';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/main/pipes/pipes.module';
import { NgxTinymceModule } from 'ngx-tinymce';
import { ListArticlesComponent } from './list-articles/list-articles.component';
import { ArticleService } from './article.service'
import { AddArticleComponent } from './crud/add-article.component';
import { AddArticleTaxComponent } from './add-article-tax/add-article-tax.component';

const routes: Routes = [
  {
    path: 'admin/articulos',
    component: ListArticlesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/articulos/add',
    component: AddArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/articulos/view/:id',
    component: AddArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/articulos/update/:id',
    component: AddArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/articulos/delete/:id',
    component: AddArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/variantes/view/:id',
    component: AddArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/variantes/update/:id',
    component: AddArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/variantes/delete/:id',
    component: AddArticleComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        DirectivesModule,
        DragDropModule,
        ProgressbarModule,
        PipesModule,
        TranslateModule,
        NgbDropdownModule,
        NgbModule,
        DatatableModule,
        NgxTinymceModule
    ],
    declarations: [
        ListArticlesComponent,
        AddArticleComponent,
        AddArticleTaxComponent

    ],
    exports: [
        AddArticleComponent,
        AddArticleTaxComponent
    ],
    providers: [
        ArticleService
    ]
})

export class ArticleModule { }
