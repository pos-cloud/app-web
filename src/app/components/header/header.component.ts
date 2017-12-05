import { Component, OnInit, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { User } from './../../models/user';
import { Config } from './../../app.config';

import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit, DoCheck {

  public identity: User;
  public online: Observable<boolean>;
  public accessType: string;

  constructor(
    public _userService: UserService,
    public _router: Router
  ) {
    this.online = Observable.merge(
      Observable.of(navigator.onLine),
      Observable.fromEvent(window, 'online').mapTo(true),
      Observable.fromEvent(window, 'offline').mapTo(false)
    );
    this.accessType = Config.accessType;
  }

  ngOnInit(): void {
    this.identity = this._userService.getIdentity();
  }

  ngDoCheck(): void {
    this.identity = this._userService.getIdentity();
  }

  public logout(): void {
    localStorage.removeItem("session_token");
    localStorage.removeItem("user");
    this.identity = undefined;
    this._router.navigate(['/']);
  }
} 
