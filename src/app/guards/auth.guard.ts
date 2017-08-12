import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UserService } from './../services/user.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private _router: Router,
    private _userService: UserService
  ) { }
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    let token = localStorage.getItem('session_token');

    this._userService.isValidToken(token).subscribe(
      result => {
        console.log(result);
        if (!result.user) {
          this._router.navigate(['/login']);
        } else {
          this._router.navigate(['/pos']);
        }
      },
      error => {
        this._router.navigate(['/login']);
      }
    );
    // not logged in so redirect to login page with the return url
    this._router.navigate(['/login']);
    return true;
  }
}
