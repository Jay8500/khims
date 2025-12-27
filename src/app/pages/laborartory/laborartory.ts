import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface LabOrder {
  id: number;
  sampleId: string;
  patientName: string;
  uhid: string;
  tests: string[];
  priority: 'Routine' | 'STAT';
  status: 'Pending' | 'Collected' | 'In-Progress' | 'Completed';
  requestDate: string;
}

@Component({
  selector: 'app-laboratory',
  imports: [CommonModule, FormsModule],
  templateUrl: 'laborartory.html',
  standalone: true,
})
export class LaboratoryComponent {
  // 1. State Management
  public labQueue = signal<LabOrder[]>([
    {
      id: 1,
      sampleId: 'L-9921',
      patientName: 'John Doe',
      uhid: '88291',
      tests: ['CBC', 'LFT'],
      priority: 'STAT',
      status: 'Pending',
      requestDate: new Date().toISOString(),
    },
  ]);

  public showResultEntry = signal(false);
  public selectedOrder = signal<LabOrder | null>(null);

  // 2. Computed Values (Lead Tip: Great for Dashboards)
  public statCount = computed(
    () => this.labQueue().filter((order) => order.priority === 'STAT').length
  );

  // 3. Handlers
  openResultEntry(order: LabOrder) {
    this.selectedOrder.set(order);
    this.showResultEntry.set(true);
  }

  updateStatus(id: number, newStatus: LabOrder['status']) {
    this.labQueue.update((orders) =>
      orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  }

  saveFinalResults(resultsData: any) {
    const order = this.selectedOrder();
    if (!order) return;

    // Logic: 1. Save results to 'lab_results' table
    //        2. Update 'lab_requests' status to 'Completed'
    console.log(`✅ Authorizing results for ${order.sampleId}`, resultsData);

    this.updateStatus(order.id, 'Completed');
    this.showResultEntry.set(false);

    // Lead Tip: Trigger a notification to the Doctor's dashboard here
  }

  authorizeResults(resultsData: any) {
    const order = this.selectedOrder();
    if (!order) return;

    // 1. Prepare the payload for Supabase
    const finalPayload = {
      request_id: order.id,
      patient_uhid: order.uhid,
      results: resultsData, // e.g., { hb: 14.2, wbc: 5000 }
      authorized_by: 'Tech_ID_01',
      released_at: new Date().toISOString(),
    };

    // 2. Update local state (Optimistic Update)
    this.labQueue.update(
      (orders) => orders.filter((o) => o.id !== order.id) // Remove from Lab's "Active" queue
    );

    console.log('🚀 Results Released to Doctor:', finalPayload);

    // 3. Close Sidebar
    this.showResultEntry.set(false);
  }
}
