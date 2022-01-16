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
import { ListVariantValuesComponent } from './list-variant-values/list-variant-values.component';
import { VariantValueComponent } from './crud/variant-value.component';
import { VariantValueService } from './variant-value.service';

const routes: Routes = [
  {
    path: 'variant-values',
    component: ListVariantValuesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'variant-values/add',
    component: VariantValueComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'variant-values/view/:id',
    component: VariantValueComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'variant-values/update/:id',
    component: VariantValueComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'variant-values/delete/:id',
    component: VariantValueComponent,
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
        ListVariantValuesComponent,
        VariantValueComponent
    ],
    exports: [
        VariantValueComponent
    ],
    providers: [
        VariantValueService
    ]
})

export class VariantValueModule { }
