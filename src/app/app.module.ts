import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

//rutas
import { RoutingModule } from './app.routes';

//servicios
import { ArticleService } from './services/article.service';
import { WaiterService } from './services/waiter.service';

//componentes
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { AppComponent } from './app.component';
import { ListArticlesComponent } from './components/list-articles/list-articles.component';
import { AddArticleComponent } from './components/add-article/add-article.component';
import { UpdateArticleComponent } from './components/update-article/update-article.component';
import { DeleteArticleComponent } from './components/delete-article/delete-article.component';
import { ListWaitersComponent } from './components/list-waiters/list-waiters.component';
import { AddWaiterComponent } from './components/add-waiter/add-waiter.component';
import { UpdateWaiterComponent } from './components/update-waiter/update-waiter.component';
import { DeleteWaiterComponent } from './components/delete-waiter/delete-waiter.component';

//pipe
import { FilterPipe } from './pipes/filter.pipe';
import { OrderByPipe } from './pipes/order-by.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    ListArticlesComponent,
    AddArticleComponent,
    UpdateArticleComponent,
    DeleteArticleComponent,
    ListWaitersComponent,
    AddWaiterComponent,
    UpdateWaiterComponent,
    DeleteWaiterComponent,
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
    ArticleService,
    WaiterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
