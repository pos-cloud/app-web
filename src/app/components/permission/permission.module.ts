import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { PipesModule } from 'app/core/pipes/pipes.module';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { NgxTinymceModule } from 'ngx-tinymce';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { DatatableModule } from '../datatable/datatable.module';
import { PermissionComponent } from './crud/permission.component';
import { ListPermissionsComponent } from './list-permissions/list-permissions.component';
import { PermissionService } from './permission.service';

const routes: Routes = [
  {
    path: 'permissions',
    component: ListPermissionsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'permissions/add',
    component: PermissionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'permissions/view/:id',
    component: PermissionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'permissions/update/:id',
    component: PermissionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'permissions/delete/:id',
    component: PermissionComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FocusDirective,
    DragDropModule,
    ProgressbarModule,
    PipesModule,
    TranslateModule,
    NgbDropdownModule,
    NgbModule,
    DatatableModule,
    NgxTinymceModule,
  ],
  declarations: [ListPermissionsComponent, PermissionComponent],
  exports: [PermissionComponent],
  providers: [PermissionService],
})
export class PermissionModule {}
