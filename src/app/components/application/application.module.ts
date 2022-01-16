import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationComponent } from './crud/application.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import { ApplicationService } from './application.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule } from '../datatable/datatable.module';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/main/pipes/pipes.module';
import { ListApplicationsComponent } from './list-applications/list-applications.component';
import { NgxTinymceModule } from 'ngx-tinymce';

const routes: Routes = [
  {
    path: 'applications',
    component: ListApplicationsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'applications/add',
    component: ApplicationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'applications/view/:id',
    component: ApplicationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'applications/update/:id',
    component: ApplicationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'applications/delete/:id',
    component: ApplicationComponent,
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
        ListApplicationsComponent,
        ApplicationComponent
    ],
    exports: [
        ApplicationComponent
    ],
    providers: [
        ApplicationService
    ]
})

export class ApplicationModule { }
