// ANGULAR
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import {
  Event as NavigationEvent,
  NavigationStart,
  Router,
} from '@angular/router';
import {
  Observable,
  fromEvent as observableFromEvent,
  merge as observableMerge,
  of as observableOf,
} from 'rxjs';
import { mapTo } from 'rxjs/operators';

// DE TERCEROS
import {
  NgbActiveModal,
  NgbAlertConfig,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

// MODELS
import { User } from '../../components/user/user';

// SERVICES
import { AuthService } from 'app/core/services/auth.service';
import { ConfigService } from 'app/core/services/config.service';
import { AddUserComponent } from '../../components/user/user/add-user.component';
import { ClaimComponent } from '../claim/claim.component';
//import { Socket } from 'ngx-socket-io';
import { PushNotificationsService } from 'app/core/services/notification.service';
import { UserService } from 'app/core/services/user.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { CurrentAccountDetailsComponent } from '../../components/print/current-account-details/current-account-details.component';

@Component({
  selector: 'app-header2',
  templateUrl: './header2.component.html',
  styleUrls: ['./header2.component.scss'],
})
export class Header2Component {
  @ViewChild('navbarNav') navbarNav!: ElementRef;

  toggleNavbar = false;
  public config$: any;
  public identity$: Observable<User>;
  public user$: Observable<User>;
  public online$: Observable<boolean>;
  public online: boolean = true;
  public hideMenu: boolean = true;
  public sessionTimer: any;
  public pathLocation: string[];
  public isReportVisible: boolean;
  public readedNotification: boolean;
  public intervalSocket;
  public notificationMessage: string;
  showAccordion = false;

  constructor(
    private _authService: AuthService,
    public _configService: ConfigService,
    public _router: Router,
    public elementRef: ElementRef,
    public renderer: Renderer2,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    //private socket: Socket,
    private _toastService: ToastService,
    private _notificationService: PushNotificationsService,
    private _userService: UserService
  ) {
    // OCULTAR MENU REPORTE
    this.isReportVisible = false;
    //pedimos permiso
    this._notificationService.requestPermission();
    // REVISAR INTERNET
    this.online$ = observableMerge(
      observableOf(navigator.onLine),
      observableFromEvent(window, 'online').pipe(mapTo(true)),
      observableFromEvent(window, 'offline').pipe(mapTo(false))
    );

    this.online$.subscribe((result) => {
      if (!this.online && result) {
        this._toastService.showToast({
          message: 'Conexión a internet restablecida',
          type: 'success',
        });
      }
      if (!result) {
        this._toastService.showToast({
          message:
            'Se ha perdido la conexión a internet, por favor verificar su red',
          type: 'warning',
        });
      }
      this.online = result;
    });

    // VERIFICAR LOGUEO Y CARGAR DATOS DE USUARIO
    this.config$ = this._configService.getConfig;
    this.identity$ = this._authService.getIdentity;

    this._router.events.forEach((event: NavigationEvent) => {
      if (event instanceof NavigationStart) {
        let pathLocation: string[] = event.url.split('?')[0].split('/');
        if (
          pathLocation[1] === 'login' ||
          pathLocation[1] === 'registrar' ||
          pathLocation[2] === 'retiro-de-pedidos' ||
          pathLocation[2] === 'armado-de-pedidos' ||
          pathLocation[2] === 'cocina' ||
          pathLocation[3] === 'agregar-transaccion' ||
          pathLocation[3] === 'editar-transaccion' ||
          pathLocation[7] === 'agregar-transaccion' ||
          pathLocation[7] === 'editar-transaccion' ||
          pathLocation[8] === 'agregar-transaccion' ||
          pathLocation[2] === 'ver-galeria'
        ) {
          this.hideMenu = true;
          this.makeVisibleReport(false);
        } else {
          this.hideMenu = false;
        }
      }
    });

    // this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
    // });

    //this.initSocket();
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.readedNotification = false;
      this.notificationMessage = localStorage.getItem('notificationMessage');
    }, 3000);
  }

  toggleAccordion() {
    this.showAccordion = !this.showAccordion;
  }

  // private initSocket(): void {

  //     let identity: User = JSON.parse(sessionStorage.getItem('user'));

  //     if (identity && Config.database && Config.database !== '') {

  //         if (!this.socket.ioSocket.connected) {
  //             // INICIAMOS SOCKET
  //             this.socket.emit('start', {
  //                 database: Config.database,
  //                 clientType: 'pos'
  //             });

  //             // ESCUCHAMOS SOCKET
  //             this.socket.on('message', (mnj) => {
  //                 this.showToast(mnj);
  //                 this.showNotification(mnj);
  //             });

  //             if (this.intervalSocket) {
  //                 clearInterval(this.intervalSocket);
  //             }
  //         }

  //         // INICIAR CONTADOR PARA VERIFICAR CONEXION DE SOCKET
  //         this.intervalSocket = setInterval(() => {
  //             if (!this.socket.ioSocket.connected) {
  //                 this.initSocket();
  //             }
  //         }, 5000);
  //     }
  // }

  public readNotification(): void {
    this.readedNotification = true;
  }

  public openModal(op: string, origin?: string): void {
    this.makeVisibleReport(false);
    let modalRef;
    switch (op) {
      case 'view-user':
        modalRef = this._modalService.open(AddUserComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.operation = 'view';
        modalRef.componentInstance.readonly = true;
        this._authService.getIdentity.subscribe((identity) => {
          if (modalRef != null && modalRef.componentInstance) {
            modalRef.componentInstance.userId = identity._id;
          }
        });
        modalRef.result.then(
          (result) => {},
          (reason) => {}
        );
        break;
      case 'update-user':
        modalRef = this._modalService.open(AddUserComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.operation = 'update';
        modalRef.componentInstance.readonly = false;
        this._authService.getIdentity.subscribe((identity) => {
          if (modalRef != null && modalRef.componentInstance) {
            modalRef.componentInstance.userId = identity._id;
          }
        });
        modalRef.result.then(
          (result) => {},
          (reason) => {}
        );
        break;
      case 'claim':
        modalRef = this._modalService.open(ClaimComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.result.then(
          (result) => {},
          (reason) => {}
        );
        break;
      case 'current':
        modalRef = this._modalService.open(CurrentAccountDetailsComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.companyType = origin;
        modalRef.result.then(
          (result) => {},
          (reason) => {}
        );
        break;

      case 'changelogs':
        window.open('https://docs.poscloud.ar/books/actualizaciones', '_blank');
        break;
      case 'documentation':
        window.open('https://docs.poscloud.ar', '_blank');
        break;
      case 'chat':
        break;
      default:
        break;
    }
  }

  public goToHome(): void {
    this._router.navigate(['/']);
  }

  public makeVisibleReport(visible: boolean): void {
    if (visible) {
      this.isReportVisible = !this.isReportVisible;
    } else {
      this.isReportVisible = false;
    }
  }

  public openReport(link: string): void {
    this.isReportVisible = false;
    this.closeNavbar();
    this._router.navigate([link]);
  }

  public logout(): void {
    this.makeVisibleReport(false);
    //this.socket.emit('finish');
    this._authService.logoutStorage();
  }

  public showNotification(message: string) {
    let data: Array<any> = [];
    data.push({
      title: 'Pedido',
      alertContent: message,
    });
    this._notificationService.generateNotification(data);
  }

  public reload() {
    window.location.reload();
  }

  toggleMenu() {
    console.log('entro');
    this.toggleNavbar = !this.toggleNavbar;
  }

  closeNavbar() {
    const navbar = this.navbarNav.nativeElement;
    if (navbar.classList.contains('show')) {
      navbar.classList.remove('show');
    }
  }
}
