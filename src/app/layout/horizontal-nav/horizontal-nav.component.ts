import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { NavNode } from '../navigation/navigation.types';

@Component({
  selector: 'app-horizontal-nav',
  templateUrl: './horizontal-nav.component.html',
  styleUrls: ['./horizontal-nav.component.scss'],
})
export class HorizontalNavComponent {
  @Input() menu: NavNode[] = [];
  @Output() itemClick = new EventEmitter<void>();

  @ViewChildren('dd') dds: QueryList<NgbDropdown>;

  onItemClick(): void {
    this.dds?.forEach((dd) => dd.close());
    this.itemClick.emit();
  }

  trackByLabel(_index: number, node: NavNode): string {
    return node.label + (node.link || '');
  }
}
