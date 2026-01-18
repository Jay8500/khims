import { CommonModule } from '@angular/common';
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Supabase } from '../../services/supabase';

interface StockItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit: string; // e.g., 'Tabs', 'Vials', 'Bottles'
  price: number;
  expiry: string;
}
@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {
  private supabase = inject(Supabase);
  // Master Inventory Signal
  inventory = signal<StockItem[]>([]);
  showAddStock = signal(false);
  searchTerm = signal('');

  constructor() {}

  async ngOnInit() {
    await this.supabase.tenantReady;
    await this.loadInventory();
  }
  async loadInventory() {
    try {
      const res = await this.supabase.getInventory();
      if (res.statusCode === 200) {
        this.inventory.set(res.data);
      }
    } catch (e) {
      console.log('e ', e);
    }
  }

  filteredInventory = computed(() => {
    return this.inventory().filter((item) =>
      item.name.toLowerCase().includes(this.searchTerm().toLowerCase()),
    );
  });

  addStock(item: any) {
    const newItem = { ...item, id: Date.now() };
    this.inventory.update((current) => [...current, newItem]);
  }

  async saveNewStock(formValue: any, form: NgForm) {
    // Include the new fields in the payload
    const res = await this.supabase.saveInventoryItem(formValue);

    if (res.statusCode === 200) {
      this.inventory.update((prev) => [res.data, ...prev]);
      this.showAddStock.set(false);
      form.resetForm();
    }
  }

  async deleteItem(id: any) {
    const res = await this.supabase.deleteInventoryItem(id);
    if (res.statusCode === 200) {
      this.inventory.update((items) => items.filter((i: any) => i.id !== id));
    }
  }

  lowStockCount = computed(() => {
    return this.inventory().filter((item) => item.stock < 50).length;
  });
}
