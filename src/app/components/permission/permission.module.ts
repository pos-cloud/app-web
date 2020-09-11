import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionComponent } from './crud/permission.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import { PermissionService } from './permission.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule } from '../datatable/datatable.module';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/main/pipes/pipes.module';
import { ListPermissionsComponent } from './list-permissions/list-permissions.component';
import { NgxTinymceModule } from 'ngx-tinymce';

const routes: Routes = [
  {
    path: 'permissions',
    component: ListPermissionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'permissions/add',
    component: PermissionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'permissions/view/:id',
    component: PermissionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'permissions/update/:id',
    component: PermissionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'permissions/delete/:id',
    component: PermissionComponent,
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
    ListPermissionsComponent,
    PermissionComponent
  ],
  exports: [
    PermissionComponent
  ],
  entryComponents: [
    PermissionComponent
  ],
  providers: [
    PermissionService
  ]
})

export class PermissionModule { }
