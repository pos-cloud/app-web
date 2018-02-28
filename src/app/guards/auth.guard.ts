import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { User } from './../models/user';
import { UserService } from './../services/user.service';

@Injectable()
export class AuthGuard implements CanActivate {

  public roles: Array<string>;
  public identity: User;
  constructor(
    private _router: Router,
    private _userService: UserService
  ) { }
  
  canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    this.roles = route.data["roles"];
    this.identity = this._userService.getIdentity();
    if (this.identity && 
        this.identity.employee && 
        this.identity.employee.type && 
        this.identity.employee.type.description === this.roles[0]) {
      return true;
    } else {
      this._router.navigate['/'];
      return false;
    }
  }
}
