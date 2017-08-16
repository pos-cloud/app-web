import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { User } from './../models/user';
import { UserService } from './../services/user.service';

@Injectable()
export class AuthGuard implements CanActivate {

  public roles: Array<string>;

  constructor(
    private _router: Router,
    private _userService: UserService
  ) { }
  
  canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    this.roles = route.data["roles"];

    //Buscamos si existen usuarios
    this._userService.getUsers().subscribe(
      result => {
        if (!result.users) {
          //En caso de que no existan permite usar el sistema
          return true;
        } else {
          //Si existe, exige login
          let token = localStorage.getItem('session_token');

          if (token !== null) {
            this._userService.isValidToken(token).subscribe(
              result => {
                if (!result.user) {
                  this._router.navigate(['/login']);
                  return false;
                } else {
                  this._userService.checkPermission(result.user.employee).subscribe(
                    result => {
                      if (!result.employee) {
                        this._router.navigate(['/login']);
                        return false;
                      } else {
                        if (result.employee.type.description === this.roles[0]) {
                          return true;
                        } else {
                          this._router.navigate(['/login']);
                          return false;
                        }
                      }
                    },
                    error => {
                      this._router.navigate(['/login']);
                      return false;
                    }
                  );
                }
              },
              error => {
                this._router.navigate(['/login']);
                return false;
              }
            );

          } else {
            this._router.navigate(['/login']);
            return false;
          }
        }
      },
      error => {
        return false;
      }
    );

    return true;
  }
}
