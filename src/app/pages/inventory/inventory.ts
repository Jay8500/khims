import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
export class Inventory {
  // Master Inventory Signal
  inventory = signal<StockItem[]>([
    {
      id: 1,
      name: 'Paracetamol 500mg',
      category: 'Analgesic',
      stock: 1250,
      unit: 'Tabs',
      price: 5,
      expiry: '2026-12-10',
    },
    {
      id: 2,
      name: 'Amoxicillin 250mg',
      category: 'Antibiotic',
      stock: 45,
      unit: 'Tabs',
      price: 15,
      expiry: '2025-08-22',
    },
    {
      id: 3,
      name: 'Cetrizen 10mg',
      category: 'Antihistamine',
      stock: 300,
      unit: 'Tabs',
      price: 8,
      expiry: '2026-01-15',
    },
    {
      id: 4,
      name: 'Insulin Glargine',
      category: 'Diabetes',
      stock: 12,
      unit: 'Vials',
      price: 450,
      expiry: '2025-05-30',
    },
  ]);
  showAddStock = signal(false);

  searchTerm = signal('');

  // Computed signal for real-time search filtering
  filteredInventory = computed(() => {
    return this.inventory().filter((item) =>
      item.name.toLowerCase().includes(this.searchTerm().toLowerCase())
    );
  });

  addStock(item: any) {
    const newItem = { ...item, id: Date.now() };
    this.inventory.update((current) => [...current, newItem]);
  }

  saveNewStock(formValue: any) {
    const newItem: StockItem = {
      id: Date.now(),
      name: formValue.name,
      category: formValue.category,
      stock: Number(formValue.stock),
      unit: formValue.unit,
      price: Number(formValue.price),
      expiry: formValue.expiry,
    };

    // Update the inventory list
    this.inventory.update((items) => [newItem, ...items]);

    // Close the drawer
    this.showAddStock.set(false);
  }

  deleteItem(id: number) {
    this.inventory.update((items) => items.filter((i) => i.id !== id));
  }
}
