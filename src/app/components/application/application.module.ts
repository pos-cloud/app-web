import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { PipesModule } from 'app/main/pipes/pipes.module';
import { NgbDropdownModule, NgbAlertModule, NgbTabsetModule } from '@ng-bootstrap/ng-bootstrap';
import { ExportersModule } from '../export/exporters.module';
import { ApplicationComponent } from './crud/application.component';
import { ListApplicationsComponent } from './list-applications/list-applications.component';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ApplicationService } from './application.service';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { LicenseGuard } from 'app/main/guards/license.guard';
import { BrowserModule } from '@angular/platform-browser';
import { DatatableModule } from '../datatable/datatable.module';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './i18n/', '.json');
}

const routes: Routes = [
  {
    path: 'admin/aplicaciones',
    component: ListApplicationsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    DatatableModule,
    DirectivesModule,
    ExportersModule,
    DragDropModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    ProgressbarModule,
    PipesModule,
    NgbDropdownModule,
    NgbAlertModule,
    NgbTabsetModule
  ],
  exports: [
    ApplicationComponent,
    ListApplicationsComponent
  ],
  declarations: [
    ApplicationComponent,
    ListApplicationsComponent
  ],
  entryComponents: [
    ApplicationComponent
  ],
  providers: [
    ApplicationService
  ]
})

export class ApplicationModule { }
