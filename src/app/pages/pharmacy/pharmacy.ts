import { CommonModule } from '@angular/common';
import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-pharmacy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pharmacy.html'
})
export class Pharmacy {
  // In a real app, this would come from a Shared Service
  // For the demo, we'll mock the orders arriving from the Doctor
  pharmacyQueue = signal([
    {
      id: 101,
      uhid: 'HOSP-772',
      patient: 'John Doe',
      drug: 'Paracetamol 500mg',
      qty: 10,
      status: 'Pending',
    },
    {
      id: 102,
      uhid: 'HOSP-881',
      patient: 'Jane Smith',
      drug: 'Amoxicillin 250mg',
      qty: 15,
      status: 'Pending',
    },
  ]);

  selectedOrder = signal<any>(null);
  showDispenseModal = signal(false);

  // Logic to "Issue" the medicine
  confirmDispense(order: any) {
    // 1. Update the status in the queue
    this.pharmacyQueue.update((orders) =>
      orders.map((o) => (o.id === order.id ? { ...o, status: 'Completed' } : o))
    );

    // 2. Here you would trigger the inventory reduction logic we wrote earlier
    // this.inventoryService.reduceStock(order.drug, order.qty);

    this.showDispenseModal.set(false);
    alert(`Meds issued to ${order.patient}. Inventory updated.`);
  }
}
