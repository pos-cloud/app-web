// ANGULAR
import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Router, NavigationStart, Event as NavigationEvent } from '@angular/router';
import { fromEvent as observableFromEvent, of as observableOf, merge as observableMerge, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

// DE TERCEROS
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// MODELS
import { User } from '../../components/user/user';

// SERVICES
import { LicensePaymentComponent } from '../../components/payment-method/license-payment/license-payment.component';
import { AuthService } from 'app/components/login/auth.service';
import { ConfigService } from 'app/components/config/config.service';
import { AddUserComponent } from '../../components/user/user/add-user.component';
import { ClaimComponent } from '../claim/claim.component';
import { ToastrService } from 'ngx-toastr';
import { Config } from 'app/app.config';
import { Socket } from 'ngx-socket-io';
import { CurrentAccountDetailsComponent } from '../../components/print/current-account-details/current-account-details.component';
import { PushNotificationsService } from 'app/components/notification/notification.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})

export class HeaderComponent {

	public config$: any;
	public identity$: Observable<User>;
  public online$: Observable<boolean>;
  public online: boolean = true;
	public hideMenu: boolean;
	public sessionTimer: any;
	public pathLocation: string[];
	public isReportVisible: boolean;
	public readedNotification: boolean;
  public intervalSocket;
  public notificationMessage: string;

	constructor(
		private _authService: AuthService,
		public _configService: ConfigService,
		public _router: Router,
		public elementRef: ElementRef,
		public renderer: Renderer2,
		public activeModal: NgbActiveModal,
		public alertConfig: NgbAlertConfig,
		public _modalService: NgbModal,
		private socket: Socket,
        private _toastr: ToastrService,
        private _notificationService: PushNotificationsService
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

    this.online$.subscribe(
      result => {
        if (!this.online && result) {
          this.showToast('Conexión a internet restablecida', 'success');
        }
        if (!result) {
          this.showToast('Se ha perdido la conexión a internet, por favor verificar su red', 'warning');
        }
        this.online = result;
      }
    );

		// VERIFICAR LOGUEO Y CARGAR DATOS DE USUARIO
		this.config$ = this._configService.getConfig;
		this.identity$ = this._authService.getIdentity;

		this._router.events.forEach((event: NavigationEvent) => {
			if (event instanceof NavigationStart) {
				let pathLocation: string[] = event.url.split('?')[0].split('/');
				if (pathLocation[1] === "login" ||
					pathLocation[1] === "registrar" ||
					pathLocation[2] === "retiro-de-pedidos" ||
					pathLocation[2] === "armado-de-pedidos" ||
					pathLocation[2] === "cocina" ||
					pathLocation[3] === "agregar-transaccion" ||
					pathLocation[3] === "editar-transaccion" ||
					pathLocation[7] === "agregar-transaccion" ||
					pathLocation[7] === "editar-transaccion" ||
                    pathLocation[8] === "agregar-transaccion" ||
                    pathLocation[2] === "ver-galeria" ) {
					this.hideMenu = true;
					this.makeVisibleReport(false);
				} else {
					this.hideMenu = false;
				}
			}
		});

		// this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
		// });

		this.initSocket();
  }

  public ngAfterViewInit() {
      setTimeout(() => {
        this.readedNotification = false;
        this.notificationMessage = localStorage.getItem('notificationMessage');
      }, 3000);
  }

	private initSocket(): void {

		let identity: User = JSON.parse(sessionStorage.getItem('user'));

		if (identity && Config.database && Config.database !== '') {

			if (!this.socket.ioSocket.connected) {
				// INICIAMOS SOCKET
				this.socket.emit('start', {
					database: Config.database,
					clientType: 'pos'
				});

				// ESCUCHAMOS SOCKET
				this.socket.on('message', (mnj) => {
                    this.showToast(mnj);
                    this.showNotification(mnj);
				});

				if (this.intervalSocket) {
					clearInterval(this.intervalSocket);
				}
			}

			// INICIAR CONTADOR PARA VERIFICAR CONEXION DE SOCKET
			this.intervalSocket = setInterval(() => {
				if (!this.socket.ioSocket.connected) {
					this.initSocket();
				}
			}, 5000);
		}
	}

	public readNotification(): void {
		this.readedNotification = true;
	}

	public openModal(op: string, origin?:string): void {

		this.makeVisibleReport(false);
		let modalRef;
		switch (op) {
			case 'view-user':
				modalRef = this._modalService.open(AddUserComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.operation = 'view';
				modalRef.componentInstance.readonly = true;
				this._authService.getIdentity.subscribe(
					identity => {
						if (modalRef != null && modalRef.componentInstance) {
							modalRef.componentInstance.userId = identity._id;
						}
					},
				);
				modalRef.result.then((result) => {

				}, (reason) => {

				});
				break;
			case 'update-user':
				modalRef = this._modalService.open(AddUserComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.operation = 'update';
				modalRef.componentInstance.readonly = false;
				this._authService.getIdentity.subscribe(
					identity => {
						if (modalRef != null && modalRef.componentInstance) {
							modalRef.componentInstance.userId = identity._id;
						}
					},
				);
				modalRef.result.then((result) => {

				}, (reason) => {

				});
				break;
			case 'pay-license':
				modalRef = this._modalService.open(LicensePaymentComponent, { size: 'lg', backdrop: 'static' });
				modalRef.result.then((result) => {

				}, (reason) => {

				});
				break;
			case 'claim':
				modalRef = this._modalService.open(ClaimComponent, { size: 'lg', backdrop: 'static' });
				modalRef.result.then((result) => {

				}, (reason) => {

				});
                break;
            case 'current' :

            modalRef = this._modalService.open(CurrentAccountDetailsComponent,{ size: 'lg', backdrop: 'static' });
            modalRef.componentInstance.companyType = origin
            modalRef.result.then((result) => {

            }, (reason) => {

            });
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
		this._router.navigate([link]);
	}

	public logout(): void {
		this.makeVisibleReport(false);
		this.socket.emit('finish');
		this._authService.logoutStorage();
	}

	public showToast(message: string, type: string = 'success'): void {
		switch (type) {
			case 'success':
				this._toastr.success('', message);
				break;
			case 'info':
				this._toastr.info('', message);
				break;
			case 'warning':
				this._toastr.warning('', message);
				break;
			case 'danger':
				this._toastr.error('', message);
				break;
			default:
				this._toastr.success('', message);
				break;
		}
    }
    
    public showNotification (message : string){
        let data: Array < any >= [];
        data.push({
            'title': 'Pedido',
            'alertContent': message
        });
        this._notificationService.generateNotification(data);
      }
}
