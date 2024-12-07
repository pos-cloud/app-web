import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { RoomComponent } from './crud/room.component';
import { ListRoomsComponent } from './list/list-room.component';

const routes: Routes = [
  {
    path: '',
    component: ListRoomsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add',
    component: RoomComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view/:id',
    component: RoomComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update/:id',
    component: RoomComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'delete/:id',
    component: RoomComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoomRoutingModule {}
