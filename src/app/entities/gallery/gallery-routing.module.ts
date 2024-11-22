import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard'; // Asegura que las rutas estén protegidas
import { GalleryComponent } from './crud/gallery.component';
import { ListGalleriesComponent } from './list-galleries/list-galleries.component'; // Componente para listar los makes

const routes: Routes = [
  {
    path: '', // Ruta por defecto para "makes"
    component: ListGalleriesComponent,
    canActivate: [AuthGuard], // Solo usuarios autenticados
  },
  {
    path: 'add', // Ruta para agregar un nuevo make
    component: GalleryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view/:id', // Ruta para ver detalles de un make por su id
    component: GalleryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update/:id', // Ruta para editar un make por su id
    component: GalleryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'delete/:id', // Ruta para eliminar un make por su id
    component: GalleryComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Importa las rutas como rutas hijas del módulo
  exports: [RouterModule], // Exporta el RouterModule para que se pueda usar en el módulo principal
})
export class GalleryRoutingModule {}
