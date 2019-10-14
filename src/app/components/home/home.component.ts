import { Component, ViewEncapsulation } from '@angular/core';
import { UserService } from 'app/services/user.service';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
import { User } from 'app/models/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class HomeComponent {

  public user: User;
  public identity: User;
  
  constructor(
    private _userService: UserService,
    private _authService: AuthService,
    public _router: Router,
  ) {
    this.user = new User ();
  }

  ngOnInit(): void {

    // this._userService.getURL().subscribe(
    //   result => {
    //     document.getElementById('embeddedChart')['src'] = result.url;
    //   }
    // );

    this._authService.getIdentity.subscribe(
      identity => {
        this.identity = identity;
        if(this.identity ) {
          this.getUser();
        }
      },
    );
  }

  public getUser(): void {

    this._userService.getUser(this.identity._id).subscribe(
      result => {
        if (!result.user) {
        } else {
          this.user = result.user;
        }
      },
      error => {
      }
    );
  }
}