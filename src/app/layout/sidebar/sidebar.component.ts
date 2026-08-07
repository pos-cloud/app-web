import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'app/core/services/auth.service';
import { User } from '@types';
import { NavigationService } from '../navigation/navigation.service';
import { NavNode } from '../navigation/navigation.types';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  menu$: Observable<NavNode[]>;
  collapsed$: Observable<boolean>;
  mobileOpen$: Observable<boolean>;
  hideMenu$: Observable<boolean>;
  peekOpen$: Observable<boolean>;
  identity$: Observable<User>;

  expandedKeys = new Set<string>();
  img = 'assets/img/logo.png';

  private subs = new Subscription();

  constructor(private _nav: NavigationService, private _authService: AuthService) {
    this.menu$ = this._nav.menu$;
    this.collapsed$ = this._nav.collapsed$;
    this.mobileOpen$ = this._nav.mobileOpen$;
    this.hideMenu$ = this._nav.hideMenu$;
    this.peekOpen$ = this._nav.peekOpen$;
    this.identity$ = this._authService.getIdentity;
  }

  ngOnInit(): void {
    this.subs.add(
      this.collapsed$.subscribe((collapsed) => {
        if (collapsed) {
          this.expandedKeys.clear();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  closeMobile(): void {
    this._nav.closeMobile();
  }

  closeOverlay(): void {
    this._nav.closeMobile();
    this._nav.closePeek();
  }

  onSidebarEnter(): void {
    if (this._nav.collapsed) {
      this._nav.setPeekOpen(true);
    }
  }

  onSidebarLeave(): void {
    if (this._nav.collapsed) {
      this._nav.setPeekOpen(false);
    }
  }

  isExpanded(key: string): boolean {
    return this.expandedKeys.has(key);
  }

  toggleExpand(key: string, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.expandedKeys.has(key)) {
      this.expandedKeys.delete(key);
    } else {
      this.expandedKeys.add(key);
    }
  }

  onLinkClick(): void {
    this._nav.closeMobile();
    this.expandedKeys.clear();

    const isDesktop = window.matchMedia('(min-width: 992px)').matches;
    if (isDesktop) {
      this._nav.collapse();
    }
  }

  trackByLabel(_index: number, node: NavNode): string {
    return node.label + (node.link || '');
  }
}
