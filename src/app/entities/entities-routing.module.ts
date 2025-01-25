import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { LicenseGuard } from 'app/core/guards/license.guard';

const routes: Routes = [
  {
    path: 'banks',
    loadChildren: () => import('./bank/bank.module').then((m) => m.BankModule),
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'makes',
    loadChildren: () => import('./make/make.module').then((m) => m.MakeModule),
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'currencies',
    loadChildren: () => import('./currency/currency.module').then((m) => m.CurrencyModule),
    canActivate: [AuthGuard, LicenseGuard],
  },

  {
    path: 'galleries',
    loadChildren: () => import('./gallery/gallery.module').then((m) => m.GalleryModule),
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'resources',
    loadChildren: () => import('./resource/resource.module').then((m) => m.ResourceModule),
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'employees',
    loadChildren: () => import('./employee/employee.module').then((m) => m.EmployeeModule),
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'employee-types',
    loadChildren: () => import('./employee-type/employee-type.module').then((m) => m.EmployeeTypeModule),
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'rooms',
    loadChildren: () => import('./room/room.module').then((m) => m.RoomModule),
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'tables',
    loadChildren: () => import('./table/table.module').then((m) => m.TableModule),
    canActivate: [AuthGuard, LicenseGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntitiesRoutingModule {}
