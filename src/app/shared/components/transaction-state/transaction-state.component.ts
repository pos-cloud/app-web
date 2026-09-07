import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-transaction-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span *ngIf="label" class="transaction-state" [attr.data-state]="label">{{ label }}</span>
  `,
})
export class TransactionStateComponent {
  @Input() state: string | null | undefined;

  get label(): string {
    const value = this.state?.toString()?.trim();
    return value || '';
  }
}
