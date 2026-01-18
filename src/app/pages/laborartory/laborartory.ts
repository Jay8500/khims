import { CommonModule } from '@angular/common';
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Supabase } from '../../services/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
export class LaboratoryComponent implements OnInit {
  public supabase = inject(Supabase);

  public dynamicParameters = signal<any[]>([]);
  // 1. State Management
  public labQueue = signal<LabOrder[]>([]);

  public showResultEntry = signal(false);
  public selectedOrder = signal<LabOrder | null>(null);

  // 3. Handlers
  async openResultEntry(order: LabOrder) {
    this.selectedOrder.set(order);

    // Fetch real parameters from Supabase
    const { data, error } = await this.supabase.client.rpc('get_order_parameters', {
      p_order_id: order.id,
    });

    if (!error) {
      this.dynamicParameters.set(data);
      this.showResultEntry.set(true);
    }
  }

  updateStatus(id: number, newStatus: LabOrder['status']) {
    this.labQueue.update((orders) =>
      orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
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

  async ngOnInit() {
    await this.supabase.tenantReady;
    await this.fetchLabOrders();
    this.setupRealtime(); // Database update avvagane auto-refresh
  }

  async fetchLabOrders() {
    const { data, error } = await this.supabase.getLabQueue();
    if (!error) {
      // data null ayithe [] (empty array) set chestundi
      this.labQueue.set(data ?? []);
    } else {
      console.error('Error fetching lab queue:', error);
      this.labQueue.set([]); // Error vachina empty array set cheyadam safe
    }
  }

  setupRealtime() {
    this.supabase.client
      .channel('lab-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lab_orders',
        },
        () => {
          this.fetchLabOrders(); // Ee table lo em change jarigina grid refresh avthundi
        },
      )
      .subscribe();
  }

  async authorizeResults(resultsData: any) {
    const order = this.selectedOrder();
    if (!order) return;

    // 1. PDF Generate
    this.generatePDF(order, resultsData);

    // 2. Results ni 'lab_results' table lo insert cheyyali (schema lo ikkade undi column)
    const { error: resError } = await this.supabase.client.from('lab_results').insert({
      order_id: order.id,
      hospital_id: this.supabase.currentTenant()?.id,
      results_data: resultsData, // Ee column lab_results lo undi
      authorized_by: this.supabase.currentUser()?.id,
      released_at: new Date().toISOString(),
    });

    if (resError) {
      console.error('Error inserting into lab_results:', resError.message);
      alert('Failed to save results: ' + resError.message);
      return;
    }

    // 3. Lab Order status ni 'Completed' ga marchali
    const { error: orderError } = await this.supabase.client
      .from('lab_orders')
      .update({ status: 'Completed' })
      .eq('id', order.id);

    if (!orderError) {
      this.showResultEntry.set(false);
      // Success! Grid auto-refresh avthundi setupRealtime() valla
    }
  }

  // TS lo computed value already undi:
  public statCount = computed(
    () => this.labQueue().filter((order: any) => order.status !== 'Completed').length,
  );

  // Component lo oka search signal pettu
  public searchQuery = signal('');

  // 🔍 SEARCH LOGIC: Filter queue based on Name, UHID or Sample ID
  public filteredQueue = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.labQueue();

    return this.labQueue().filter(
      (item) =>
        item.patientName.toLowerCase().includes(query) ||
        item.uhid.toLowerCase().includes(query) ||
        item.sampleId.toLowerCase().includes(query),
    );
  });

  async generatePDF(order: any, results: any) {
    const doc = new jsPDF();
    const tenant = this.supabase.currentTenant();

    // Header Color
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');

    // Add Logo to PDF (If exists)
    if (tenant?.logo_url) {
      try {
        // Image URL ni base64 ga leda direct URL tho render cheyali
        // Note: External URLs ayithe CORS issue rakunda jspdf handle chestundi
        doc.addImage(tenant.logo_url, 'PNG', 15, 10, 20, 20);
      } catch (e) {
        console.error('Logo failed to load in PDF', e);
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    // Logo unte text position move chestam
    const textX = tenant?.logo_url ? 40 : 15;
    doc.text(tenant?.name || 'Hospital Report', textX, 25);

    doc.setFontSize(10);
    doc.text(`Sample ID: #${order.sampleId}`, 150, 20);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 28);

    // Body Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('LABORATORY REPORT', 15, 55);

    doc.setFontSize(10);
    doc.text(`Patient Name: ${order.patientName}`, 15, 65);
    doc.text(`UHID: ${order.uhid}`, 15, 71);
    doc.text(`Tests: ${order.tests.join(', ')}`, 15, 77);

    // Parameters Table
    const tableData = this.dynamicParameters().map((p) => [
      p.parameter_name,
      results[p.parameter_id] || 'N/A', // Ikkada results formValue nundi vastundi
      `${p.normal_range} ${p.unit}`,
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['Parameter', 'Result', 'Reference Range']],
      body: tableData,
      headStyles: { fillColor: [59, 130, 246] }, // Blue Header
      theme: 'grid',
    });

    doc.save(`${order.patientName}_${order.sampleId}.pdf`);
  }

  // Component class lopala add cheyandi

  async saveDraft(resultsData: any) {
    const order = this.selectedOrder();
    if (!order) return;

    // Status ni 'In-Progress' ki update chestam (Completed kadu)
    const { error } = await this.supabase.client
      .from('lab_orders')
      .update({
        status: 'In-Progress',
        result_data: resultsData,
        technician_id: this.supabase.currentUser()?.id,
      })
      .eq('id', order.id);

    if (!error) {
      alert('Draft saved successfully!');
      // Sidebar close cheyakunda user ki comfort ivvochu
      // Leda close cheyalante this.showResultEntry.set(false); pettandi
    } else {
      console.error('Draft save failed:', error);
    }
  }
}
