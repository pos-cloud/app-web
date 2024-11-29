import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { LicenseGuard } from 'app/core/guards/license.guard';

const routes: Routes = [
  {
    path: 'ventas/pedidos-web',
    loadChildren: () =>
      import('./sales/web/web.modules').then((m) => m.WebModule),
    canActivate: [AuthGuard, LicenseGuard],
  },
  // { path: 'ventas/mostrador' },
  // { path: 'ventas/pedidos-web' },
  // { path: 'ventas/lector-voucher' },
  // Rutas de Compras
  // { path: 'compras/mostrador' },
  // Rutas de Stock
  // { path: 'stock/mostrador' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModulesRoutingModule {}
