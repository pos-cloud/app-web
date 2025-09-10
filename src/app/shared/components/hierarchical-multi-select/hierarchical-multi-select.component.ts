import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface HierarchicalItem {
  _id: string;
  name: string;
  level: number;
}

@Component({
  selector: 'app-hierarchical-multi-select',
  templateUrl: './hierarchical-multi-select.component.html',
  styleUrls: ['./hierarchical-multi-select.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HierarchicalMultiSelectComponent),
      multi: true,
    },
  ],
})
export class HierarchicalMultiSelectComponent implements OnInit, ControlValueAccessor {
  @Input() items: HierarchicalItem[] = [];
  @Input() placeholder: string = 'Seleccionar categorías...';
  @Input() disabled: boolean = false;
  @Input() maxHeight: string = '300px';
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() displayText: string = '';

  public isOpen: boolean = false;
  public selectedItems: HierarchicalItem[] = [];
  public searchTerm: string = '';
  public filteredItems: HierarchicalItem[] = [];
  public uniqueId: string = '';

  private onChange = (value: string[]) => {};
  private onTouched = () => {};

  constructor() {
    this.uniqueId = 'hierarchical-multiselect-' + Math.random().toString(36).substr(2, 9);
  }

  ngOnInit(): void {
    this.filteredItems = [...this.items];
  }

  writeValue(value: string[]): void {
    if (value && value.length > 0) {
      this.selectedItems = this.items.filter((item) => value.includes(item._id));
    } else {
      this.selectedItems = [];
    }
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.onTouched();
      }
    }
  }

  public closeDropdown(): void {
    this.isOpen = false;
  }

  public onSearchChange(): void {
    if (!this.searchTerm.trim()) {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter((item) => item.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }
  }

  public toggleSelection(item: HierarchicalItem): void {
    if (this.isSelected(item)) {
      this.removeSelection(item);
    } else {
      this.addSelection(item);
    }
  }

  private addSelection(item: HierarchicalItem): void {
    this.selectedItems.push(item);
    this.onChange(this.selectedItems.map((item) => item._id));
  }

  private removeSelection(item: HierarchicalItem): void {
    this.selectedItems = this.selectedItems.filter((selected) => selected._id !== item._id);
    this.onChange(this.selectedItems.map((item) => item._id));
  }

  public isSelected(item: HierarchicalItem): boolean {
    return this.selectedItems.some((selected) => selected._id === item._id);
  }

  public getSelectedItemsText(): string {
    if (this.displayText) {
      return this.displayText;
    }
    return this.placeholder;
  }

  public removeSelectedItem(item: HierarchicalItem): void {
    this.removeSelection(item);
  }

  public getItemPadding(level: number): string {
    return `${level * 20}px`;
  }
}
