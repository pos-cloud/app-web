import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ArmarConfig, ArmarGroup, getArmarConfig } from './armar.config';

type Picked = {
  optionId: string;
  portionId: string | null;
};

type SummaryLine = {
  group: string;
  name: string;
  portion: string;
  price: number;
};

const POSCLOUD_URL = 'https://poscloud.com.ar';

@Component({
  selector: 'app-armar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './armar.component.html',
  styleUrls: ['./armar.component.scss'],
})
export class ArmarComponent implements OnInit {
  config: ArmarConfig | null = null;
  customerName = '';
  summaryOpen = false;

  private picks = new Map<string, Picked[]>();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const database = params['database'] || '';
      this.config = getArmarConfig(database);
      this.customerName = '';
      this.summaryOpen = false;
      this.picks.clear();
      if (!this.config) {
        window.location.href = POSCLOUD_URL;
      }
    });
  }

  picksOf(group: ArmarGroup): Picked[] {
    return this.picks.get(group.id) ?? [];
  }

  isSelected(group: ArmarGroup, optionId: string): boolean {
    return this.picksOf(group).some((pick) => pick.optionId === optionId);
  }

  portionOf(group: ArmarGroup, optionId: string): string | null {
    return this.picksOf(group).find((pick) => pick.optionId === optionId)?.portionId ?? null;
  }

  toggle(group: ArmarGroup, optionId: string): void {
    const current = this.picksOf(group);
    const exists = current.some((pick) => pick.optionId === optionId);
    const nextPick: Picked = { optionId, portionId: group.portions?.[0]?.id ?? null };

    if (group.selection === 'single') {
      this.picks.set(group.id, exists ? [] : [nextPick]);
      return;
    }

    this.picks.set(group.id, exists ? current.filter((pick) => pick.optionId !== optionId) : [...current, nextPick]);
  }

  setPortion(group: ArmarGroup, optionId: string, portionId: string): void {
    this.picks.set(
      group.id,
      this.picksOf(group).map((pick) => (pick.optionId === optionId ? { ...pick, portionId } : pick))
    );
  }

  displayPrice(group: ArmarGroup, optionId: string, basePrice: number): number {
    if (!this.isSelected(group, optionId)) {
      return basePrice;
    }
    return this.linePrice(group, optionId, basePrice);
  }

  get selectionCount(): number {
    let count = 0;
    this.picks.forEach((list) => {
      count += list.length;
    });
    return count;
  }

  get total(): number {
    if (!this.config) {
      return 0;
    }
    return this.config.groups.reduce((sum, group) => {
      return (
        sum +
        this.picksOf(group).reduce((groupSum, pick) => {
          const option = group.options.find((item) => item.id === pick.optionId);
          return groupSum + (option ? this.linePrice(group, pick.optionId, option.price) : 0);
        }, 0)
      );
    }, 0);
  }

  get summaryLines(): SummaryLine[] {
    if (!this.config) {
      return [];
    }
    const lines: SummaryLine[] = [];
    for (const group of this.config.groups) {
      for (const pick of this.picksOf(group)) {
        const option = group.options.find((item) => item.id === pick.optionId);
        if (!option) {
          continue;
        }
        const portion = group.portions?.find((item) => item.id === pick.portionId);
        lines.push({
          group: group.title,
          name: option.name,
          portion: portion?.label ?? '',
          price: this.linePrice(group, pick.optionId, option.price),
        });
      }
    }
    return lines;
  }

  get selectionLabel(): string {
    if (this.selectionCount === 1) {
      return '1 elección';
    }
    return `${this.selectionCount} elecciones`;
  }

  openSummary(): void {
    if (!this.selectionCount) {
      return;
    }
    this.summaryOpen = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeSummary(): void {
    this.summaryOpen = false;
  }

  onNameInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.customerName = value.slice(0, 40);
  }

  formatPrice(value: number): string {
    if (value === 0) {
      return 'Sin costo';
    }
    return this.formatAmount(value);
  }

  formatAmount(value: number): string {
    return `$${value.toLocaleString('es-AR')}`;
  }

  private linePrice(group: ArmarGroup, optionId: string, basePrice: number): number {
    const portionId = this.portionOf(group, optionId);
    const portion = group.portions?.find((item) => item.id === portionId);
    return basePrice * (portion?.multiplier ?? 1);
  }
}
