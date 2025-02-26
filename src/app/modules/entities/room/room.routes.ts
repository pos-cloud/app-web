import { Routes } from '@angular/router';

export const ROOM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-room.component').then((m) => m.ListRoomsComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/room.component').then((m) => m.RoomComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/room.component').then((m) => m.RoomComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/room.component').then((m) => m.RoomComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/room.component').then((m) => m.RoomComponent),
  },
];
