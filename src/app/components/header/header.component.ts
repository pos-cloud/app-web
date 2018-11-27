import { Component, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';
import { Router, NavigationStart, Event as NavigationEvent, NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User } from './../../models/user';
import { Config } from './../../app.config';

import { UserService } from './../../services/user.service';

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
  public isReportVisible: boolean;

  constructor(
    public _userService: UserService,
    public _router: Router,
    public elementRef: ElementRef,
    public renderer: Renderer2,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {
    this.isReportVisible = false;
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
      // this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
      //   this.sessionCount();
      // });
    } else {
      this._router.events.filter(e => e instanceof NavigationEnd).first().subscribe(() => {
        if (this._userService.getDatabase() && this._router.url !== "/registrar") {
          this._router.navigate(['/login']);
        } else {
          this._router.navigate(['/registrar']);
        }
      });
    }
  }

  public sessionCount() {
  }

  public goToHome(): void {
    if (this.identity.employee.type.description === "Administrador") {
      this._router.navigate(['/']);
    } else {
      this._router.navigate(['/']);
    }
  }

  public makeVisibleReport(visible: boolean): void {
    if(visible) {
      this.isReportVisible = !this.isReportVisible;
    } else {
      this.isReportVisible = false;
    }
  }

  public openReport(link: string): void {
    this.isReportVisible = false;
    this._router.navigate([link]);
  }

  public logout(): void {
    sessionStorage.removeItem("session_token");
    sessionStorage.removeItem("user");
    this.identity = undefined;
    this._router.navigate(['/login']);
  }
}
