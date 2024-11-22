import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { LicenseGuard } from 'app/core/guards/license.guard'; // Si también lo necesitas

const routes: Routes = [
  {
    path: 'makes', // Esto redirige a las rutas de MakeModule
    loadChildren: () => import('./make/make.module').then((m) => m.MakeModule), // Lazy load MakeModule
    canActivate: [AuthGuard, LicenseGuard], // Protege las rutas con guardias si es necesario
  },
  {
    path: 'articles',
    loadChildren:  () => import('./article/article.module').then((m) => m.ArticleModule), 
    canActivate: [AuthGuard, LicenseGuard], 
  },
  {
    path: 'galleries',
    loadChildren:  () => import('./gallery/gallery.module').then((m) => m.GalleryModule), 
    canActivate: [AuthGuard, LicenseGuard], 
  },
  {
    path: 'resources',
    loadChildren:  () => import('./resource/resource.module').then((m) => m.ResourceModule), 
    canActivate: [AuthGuard, LicenseGuard], 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntitiesRoutingModule {}
