import { Routes } from '@angular/router';

export const GALLERY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-galleries.component').then((m) => m.ListGalleriesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/gallery.component').then((m) => m.GalleryComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./view-gallery/view-gallery.component').then((m) => m.ViewGalleryComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/gallery.component').then((m) => m.GalleryComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/gallery.component').then((m) => m.GalleryComponent),
  },
];
