// ANGULAR
import { Component, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, map, merge, Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// DE TERCEROS
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// MODELS
import { Branch, User } from '@types';

// SERVICES
import { TranslateService } from '@ngx-translate/core';
import { ChangePasswordComponent } from 'app/auth/change-password/change-password.component';
import { AuthService } from 'app/core/services/auth.service';
import { BranchService } from 'app/core/services/branch.service';
import { PushNotificationsService } from 'app/core/services/notification.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { NavNode } from '../navigation/navigation.types';
import { NavigationService } from '../navigation/navigation.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public img = 'assets/img/logo.png';
  public identity$: Observable<User>;
  public online$: Observable<boolean>;
  public online: boolean = true;
  public hideMenu$: Observable<boolean>;
  public collapsed$: Observable<boolean>;
  public menu$: Observable<NavNode[]>;
  public languages = ['en', 'es', 'it'];
  public currentLanguage = 'es';
  public branch: Branch | null = null;
  public horizontalCollapsed = true;
  public isSidebarLayout = true;

  private destroy$ = new Subject<void>();

  constructor(
    private _authService: AuthService,
    private _toastService: ToastService,
    private _modalService: NgbModal,
    private translate: TranslateService,
    private _notificationService: PushNotificationsService,
    private _nav: NavigationService,
    private _branchService: BranchService
  ) {
    this.hideMenu$ = this._nav.hideMenu$;
    this.collapsed$ = this._nav.collapsed$;
    this.menu$ = this._nav.menu$;
    this.isSidebarLayout = this._nav.isSidebarLayout;
    this._notificationService.requestPermission();
    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
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
          message: 'Se ha perdido la conexión a internet, por favor verifique su red',
          type: 'warning',
        });
      }
      this.online = result;
    });

    this.identity$ = this._authService.getIdentity;
  }

  ngOnInit(): void {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.currentLanguage = savedLang;
      this.translate.use(savedLang);
    }

    this._authService.getIdentity.pipe(takeUntil(this.destroy$)).subscribe((identity) => {
      if (identity) {
        this.loadFirstBranch();
      } else {
        this.branch = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get branchName(): string {
    if (!this.branch) {
      return '';
    }
    return this.branch.fantasyName || this.branch.name || '';
  }

  get branchLogo(): string | null {
    const image = this.branch?.image?.trim();
    if (!image || image === 'default.jpg' || image.includes('default.jpg')) {
      return null;
    }
    return image;
  }

  public toggleCollapsed(): void {
    this._nav.toggleCollapsed();
  }

  public onCollapseHover(enter: boolean): void {
    if (!this._nav.collapsed) {
      return;
    }
    this._nav.setPeekOpen(enter);
  }

  public switchToClassic(): void {
    this._nav.switchLayoutAndReload('horizontal');
  }

  public switchToSidebar(): void {
    this._nav.switchLayoutAndReload('sidebar');
  }

  public toggleHorizontalMenu(): void {
    this.horizontalCollapsed = !this.horizontalCollapsed;
  }

  public closeHorizontalMenu(): void {
    this.horizontalCollapsed = true;
  }

  private loadFirstBranch(): void {
    this._branchService
      .getBranches(
        { name: 1, fantasyName: 1, image: 1, number: 1 },
        { operationType: { $ne: 'D' } },
        { number: 1 },
        {},
        1,
        0
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.branch = result?.branches?.[0] ?? null;
      });
  }

  public openModal(op: string): void {
    let modalRef;
    switch (op) {
      case 'soporte':
        window.open('https://api.whatsapp.com/send/?phone=5493564368535', '_blank');
        break;
      case 'changelogs':
        window.open('https://docs.poscloud.ar/books/actualizaciones', '_blank');
        break;
      case 'documentation':
        window.open('https://docs.poscloud.ar', '_blank');
        break;
      case 'change-password':
        modalRef = this._modalService.open(ChangePasswordComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.model = 'articles';
        modalRef.componentInstance.title = 'Importar artículos';
        modalRef.result.then(
          () => {},
          () => {}
        );
        break;
      default:
        break;
    }
  }

  public logout(): void {
    this._authService.logoutStorage();
  }

  public reload() {
    window.location.reload();
  }

  public toggleMobileMenu() {
    this._nav.toggleMobileOpen();
  }

  public changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    this.translate.use(lang).subscribe(() => {
      this.translate.reloadLang(lang);
    });
    localStorage.setItem('lang', lang);
  }
}
