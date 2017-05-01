import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

//rutas
import { RoutingModule } from './app.routes';

//servicios
import { ArticleService } from './services/article.service';

//componentes
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { AppComponent } from './app.component';
import { AddArticleComponent } from './components/add-article/add-article.component';
import { ListArticlesComponent } from './components/list-articles/list-articles.component';

//pipe
import { FilterPipe } from './pipes/filter.pipe';
import { OrderByPipe } from './pipes/order-by.pipe';

@NgModule({
  declarations: [
    AppComponent,
    AddArticleComponent,
    HeaderComponent,
    HomeComponent,
    ListArticlesComponent,
    FilterPipe,
    OrderByPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RoutingModule,
    NgbModule.forRoot()
  ],
  providers: [
    ArticleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
