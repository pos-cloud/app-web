import { Component, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';
import { Router, NavigationStart, Event as NavigationEvent } from '@angular/router';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User } from './../../models/user';
import { Config } from './../../app.config';

import { UserService } from './../../services/user.service';

import { LoginComponent } from './../../components/login/login.component';
import { RegisterComponent } from '../register/register.component';

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
  public sessionTimer;
  public pathLocation: string[];
  @Input() isAPIConected: boolean;
  @Input() modules;

  constructor(
    public _userService: UserService,
    public _router: Router,
    public elementRef: ElementRef,
    public renderer: Renderer2,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {
    this.online = Observable.merge(
      Observable.of(navigator.onLine),
      Observable.fromEvent(window, 'online').mapTo(true),
      Observable.fromEvent(window, 'offline').mapTo(false)
    );
    this.accessType = Config.accessType;
  }

  ngOnInit(): void {
    if (this.isAPIConected) {
      this.validateIdentity();
    }
  }

  public validateIdentity(): void {

    this.identity = this._userService.getIdentity();
    
    if (this.identity) {
      this._router.events.forEach((event: NavigationEvent) => {
        if (event instanceof NavigationStart) {
          let pathLocation: string[] = event.url.split('/');
          if (pathLocation[3] === "agregar-transaccion" ||
              pathLocation[3] === "editar-transaccion" ||
              pathLocation[7] === "agregar-transaccion") {
            this.hideMenu = true;
          } else {
            this.hideMenu = false;
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
        this._router.navigate(['/']);
        modalRef = this._modalService.open(LoginComponent);
        modalRef.result.then((result) => {
          if (typeof result == 'object') {
            this.validateIdentity();
          }
        }, (reason) => {
        });
        break;
      case 'register':
        this._router.navigate(['register']);
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
