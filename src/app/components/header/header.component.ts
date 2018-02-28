import { Component, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';
import { Router, NavigationStart, Event as NavigationEvent } from '@angular/router';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User } from './../../models/user';
import { Config } from './../../app.config';

import { UserService } from './../../services/user.service';

import { LoginComponent } from './../../components/login/login.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {

  public identity: User;
  public online: Observable<boolean>;
  public accessType: string;
  public hideMenu: boolean;
  public modules: string[];
  public sessionTimer;
  public pathLocation: string[];

  constructor(
    public _userService: UserService,
    public _router: Router,
    public elementRef: ElementRef,
    public renderer: Renderer2,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {
    this.hideMenu = false;
    this.online = Observable.merge(
      Observable.of(navigator.onLine),
      Observable.fromEvent(window, 'online').mapTo(true),
      Observable.fromEvent(window, 'offline').mapTo(false)
    );
    this.accessType = Config.accessType;
  }

  ngOnInit(): void {

    this.validateIdentity();
  }

  public validateIdentity(): void {

    this.identity = this._userService.getIdentity();

    if (this.identity) {

      this._router.events.forEach((event: NavigationEvent) => {
        if (event instanceof NavigationStart) {
          if (event.url === "/pos/mostrador/editar-ticket" ||
            event.url === "/pos/mostrador/agregar-ticket") {
            this.hideMenu = true;
          }
        }
      });
      // this.sessionTimer = setTimeout(this.logout(), this.identity.tokenExpiration);
      this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
        this.sessionCount();
      });
    } else {
      this.openModal("login");
    }
  }

  public sessionCount() {

  }

  public openModal(op: string): void {

    let modalRef;

    switch (op) {
      case 'login':
        modalRef = this._modalService.open(LoginComponent);
        modalRef.result.then((result) => {
          if (typeof result == 'object') {
            this.validateIdentity();
          }
        }, (reason) => {
        });
        break;
      default:
        break;
    }
  }

  public logout(): void {
    sessionStorage.removeItem("session_token");
    sessionStorage.removeItem("user");
    this.identity = undefined;
    this._router.navigate(['/']);
  }
} 
