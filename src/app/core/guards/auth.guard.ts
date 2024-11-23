import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { User } from 'app/components/user/user';
import { AuthService } from 'app/core/services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this._authService.getIdentity.pipe(
      take(1),
      map((identity: User) => {
        if (!identity) {
          this._router.navigate(['/login'], {
            queryParams: {
              return: state.url,
            },
          });
          return false;
        }
        return true;
      })
    );
  }
}
