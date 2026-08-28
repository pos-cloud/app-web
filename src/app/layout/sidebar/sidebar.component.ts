import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { User } from '@types';
import { AuthService } from 'app/core/services/auth.service';
import { combineLatest, merge, Observable, of, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { NavigationService } from '../navigation/navigation.service';
import { NavNode } from '../navigation/navigation.types';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('collapse', [
      transition(':enter', [
        style({ height: 0, opacity: 0.35 }),
        animate('180ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('140ms ease-in', style({ height: 0, opacity: 0.35 })),
      ]),
    ]),
  ],
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
  private wasVisible = false;
  private lastUrl = '';

  constructor(
    private _nav: NavigationService,
    private _authService: AuthService,
    private _router: Router
  ) {
    this.menu$ = this._nav.menu$;
    this.collapsed$ = this._nav.collapsed$;
    this.mobileOpen$ = this._nav.mobileOpen$;
    this.hideMenu$ = this._nav.hideMenu$;
    this.peekOpen$ = this._nav.peekOpen$;
    this.identity$ = this._authService.getIdentity;
  }

  ngOnInit(): void {
    const url$ = merge(
      of(this._router.url),
      this._router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects)
      )
    );

    this.subs.add(
      combineLatest([this.menu$, url$, this.collapsed$, this.peekOpen$, this.mobileOpen$]).subscribe(
        ([menu, url, collapsed, peek, mobile]) => {
          const visible = !collapsed || peek || mobile;
          if (!visible || !menu?.length) {
            this.wasVisible = false;
            return;
          }

          const urlChanged = url !== this.lastUrl;
          const justOpened = !this.wasVisible;
          this.wasVisible = true;
          this.lastUrl = url;

          if (urlChanged || justOpened) {
            this.expandPathForUrl(menu, url);
          }
        }
      )
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
      this.expandedKeys = new Set(
        [...this.expandedKeys].filter((item) => item !== key && !item.startsWith(key + '/'))
      );
      return;
    }

    const next = new Set<string>();
    let acc = '';
    for (const part of key.split('/')) {
      acc = acc ? `${acc}/${part}` : part;
      next.add(acc);
    }
    this.expandedKeys = next;
  }

  hasActiveChild(node: NavNode): boolean {
    return this.nodeContainsUrl(node, this.normalizeUrl(this._router.url));
  }

  onLinkClick(): void {
    this._nav.closeMobile();

    const isDesktop = window.matchMedia('(min-width: 992px)').matches;
    if (isDesktop) {
      this._nav.collapse();
    }
  }

  trackByLabel(_index: number, node: NavNode): string {
    return node.label + (node.link || '');
  }

  private expandPathForUrl(menu: NavNode[], url: string): void {
    const path = this.findActivePath(menu, this.normalizeUrl(url));
    if (!path.length) {
      return;
    }

    const keys = new Set<string>();
    let acc = '';
    path.forEach((node, index) => {
      acc = acc ? `${acc}/${node.label}` : node.label;
      const isLast = index === path.length - 1;
      if (!isLast || node.children?.length) {
        keys.add(acc);
      }
    });
    this.expandedKeys = keys;
  }

  private findActivePath(nodes: NavNode[], url: string): NavNode[] {
    let best: NavNode[] = [];
    let bestLen = -1;

    const walk = (list: NavNode[], trail: NavNode[]) => {
      for (const node of list) {
        if (node.isDivider) {
          continue;
        }
        const next = [...trail, node];
        if (node.link && this.urlMatches(url, node.link)) {
          const len = node.link.length;
          if (len > bestLen) {
            best = next;
            bestLen = len;
          }
        }
        if (node.children?.length) {
          walk(node.children, next);
        }
      }
    };

    walk(nodes, []);
    return best;
  }

  private nodeContainsUrl(node: NavNode, url: string): boolean {
    if (node.link && this.urlMatches(url, node.link)) {
      return true;
    }
    return !!node.children?.some((child) => this.nodeContainsUrl(child, url));
  }

  private urlMatches(url: string, link: string): boolean {
    const path = '/' + link.replace(/^\//, '');
    return url === path || url.startsWith(path + '/');
  }

  private normalizeUrl(url: string): string {
    return (url || '/').split('?')[0];
  }
}
