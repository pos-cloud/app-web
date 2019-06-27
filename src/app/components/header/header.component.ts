
// ANGULAR
import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Router, NavigationStart, Event as NavigationEvent } from '@angular/router';
import {fromEvent as observableFromEvent, of as observableOf, merge as observableMerge,  Observable } from 'rxjs';
import {mapTo} from 'rxjs/operators';

// DE TERCEROS
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
// import { Socket } from 'ngx-socket-io';

// MODELS
import { User } from './../../models/user';

// SERVICES
import { LicensePaymentComponent } from '../license-payment/license-payment.component';
import { AuthService } from 'app/services/auth.service';
import { ConfigService } from 'app/services/config.service';
import { AddUserComponent } from '../add-user/add-user.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {

  public config$: any;
  public identity$: Observable<User>;
  public online$: Observable<boolean>;
  public hideMenu: boolean;
  public sessionTimer: any;
  public pathLocation: string[];
  public isReportVisible: boolean;  
  public licenseDays: number;
  public readedNotification: boolean = false;

  constructor(
    private _authService: AuthService,
    public _configService: ConfigService,
    public _router: Router,
    public elementRef: ElementRef,
    public renderer: Renderer2,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    // private socket: Socket,
  ) {
    // OCULTAR MENU REPORTE
    this.isReportVisible = false;

    // REVISAR INTERNET
    this.online$ = observableMerge(
      observableOf(navigator.onLine),
      observableFromEvent(window, 'online').pipe(mapTo(true)),
      observableFromEvent(window, 'offline').pipe(mapTo(false))
    );

    // REVISAR NOTIFICACION LICENCIA
    this.licenseDays = 10 - new Date().getDate();
    if(this.licenseDays.toString() !== localStorage.getItem('licenseDays')) {
      this.readedNotification = false;
      localStorage.setItem('readedNotification', this.readedNotification.toString());
      localStorage.setItem('licenseDays', this.licenseDays.toString());
    }
    if(localStorage.getItem('readedNotification')) {
      this.readedNotification = (localStorage.getItem('readedNotification') === "true");
    }

    // VERIFICAR LOGUEO Y CARGAR DATOS DE USUARIO
    this.config$ = this._configService.getConfig;
    this.identity$ = this._authService.getIdentity;

    this._router.events.forEach((event: NavigationEvent) => {
      if (event instanceof NavigationStart) {
        let pathLocation: string[] = event.url.split('/');
        if (pathLocation[1] === "login" ||
            pathLocation[1] === "registrar" ||
            pathLocation[3] === "agregar-transaccion" ||
            pathLocation[3] === "editar-transaccion" ||
            pathLocation[7] === "agregar-transaccion" ||
            pathLocation[7] === "editar-transaccion" ||
            pathLocation[8] === "agregar-transaccion" ||
            pathLocation[8] === "editar-transaccion") {
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

      // this.socket.emit('init', {
      //   identity: this.identity,
      //   database: this._userService.getDatabase()
      // });
  }

  public readNotification(): void {
    this.readedNotification = true;
    localStorage.setItem('readedNotification', this.readedNotification.toString());
  }

  public openModal(op: string): void {

    this.makeVisibleReport(false);
    let modalRef;
    switch (op) {
      case 'view-user':
        modalRef = this._modalService.open(AddUserComponent, { size: 'lg' });
        modalRef.componentInstance.operation = 'view';
        modalRef.componentInstance.readonly = true;
        this._authService.getIdentity.subscribe(
          identity => {
            if(modalRef != null && modalRef.componentInstance) {
              modalRef.componentInstance.userId = identity._id;
            }
          },
        );
        modalRef.result.then((result) => {

        }, (reason) => {

        });
        break;
      case 'update-user':
        modalRef = this._modalService.open(AddUserComponent, { size: 'lg' });
        modalRef.componentInstance.operation = 'update';
        modalRef.componentInstance.readonly = false;
        this._authService.getIdentity.subscribe(
          identity => {
            if(modalRef != null && modalRef.componentInstance) {
              modalRef.componentInstance.userId = identity._id;
            }
          },
        );
        modalRef.result.then((result) => {

        }, (reason) => {

        });
        break;
      case 'pay-license':
        modalRef = this._modalService.open(LicensePaymentComponent, { size: 'lg' });
        modalRef.result.then((result) => {

        }, (reason) => {

        });
        break;
      default: 
        break;
    }
  }

  public sessionCount() {
  }

  public goToHome(): void {
    this._router.navigate(['/']);
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
    this.makeVisibleReport(false);
    this._authService.logoutStorage();
  }
}
