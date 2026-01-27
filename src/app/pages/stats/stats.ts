import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-stats',
  imports: [CommonModule, FormsModule],
  templateUrl: './stats.html'
})
export class Stats {
  // Mocking the data source (In your app, these come from your Service)
  patients = signal([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]);
  labQueue = signal([
    { id: 101, status: 'Pending' },
    { id: 102, status: 'Pending' },
  ]);
  inventory = signal([
    { name: 'Paracetamol', stock: 10, price: 5 },
    { name: 'Amoxicillin', stock: 120, price: 15 },
  ]);

  // --- COMPUTED STATS (The Magic) ---

  totalAdmissions = computed(() => this.patients().length);

  pendingLabsCount = computed(() => this.labQueue().filter((l) => l.status === 'Pending').length);

  lowStockAlerts = computed(() => this.inventory().filter((item) => item.stock < 50).length);

  // Example of calculating total potential value of warehouse
  inventoryValue = computed(() =>
    this.inventory().reduce((acc, item) => acc + item.stock * item.price, 0)
  );

  todayRevenue = signal(42500); // This would be calculated from a 'transactions' signal
}
