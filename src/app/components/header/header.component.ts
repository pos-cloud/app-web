import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public userType: string;
  public online: Observable<boolean>;

  constructor(
    public _router: Router

  ) { 
     this.online = Observable.merge(
      Observable.of(navigator.onLine),
      Observable.fromEvent(window, 'online').mapTo(true),
      Observable.fromEvent(window, 'offline').mapTo(false)
    )
  }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
  }

  public logout() {
    localStorage.removeItem("session_token");
    this._router.navigate(['/login']);
  }
} 
