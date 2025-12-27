import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface BillItem {
  description: string;
  category: 'Consultation' | 'Lab' | 'Pharmacy' | 'Ward';
  amount: number;
  date: string;
}
@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.html',
  styleUrl: './billing.css',
})
export class Billing {
  selectedPatient = signal({ name: 'John Doe', uhid: 'HOSP-772', type: 'IP' });
  billItems = signal<BillItem[]>([
    {
      description: 'General Consultation',
      category: 'Consultation',
      amount: 500,
      date: '2023-10-01',
    },
    { description: 'CBC & Lipid Profile', category: 'Lab', amount: 1200, date: '2023-10-01' },
    {
      description: 'Paracetamol & Antibiotics',
      category: 'Pharmacy',
      amount: 450,
      date: '2023-10-02',
    },
    {
      description: 'Semi-Private Room (2 Days)',
      category: 'Ward',
      amount: 4000,
      date: '2023-10-03',
    },
  ]);

  advancePaid = signal(2000);

  // --- UI STATE SIGNALS ---
  showPaymentSidebar = signal(false);
  payType = signal<'advance' | 'refund'>('advance');

  // --- COMPUTED MATH ---
  subTotal = computed(() => this.billItems().reduce((acc, item) => acc + item.amount, 0));
  tax = computed(() => this.subTotal() * 0.05);
  grandTotal = computed(() => this.subTotal() + this.tax());
  balanceDue = computed(() => {
    const balance = this.grandTotal() - this.advancePaid();
    return balance > 0 ? balance : 0; // Don't show negative balance
  });
  refundAmount = computed(() => {
    const diff = this.advancePaid() - this.grandTotal();
    return diff > 0 ? diff : 0;
  });

  // --- METHODS ---
  handlePayment(formValue: any) {
    const amount = Number(formValue.amount);
    if (!amount || amount <= 0) return;

    if (this.payType() === 'advance') {
      this.advancePaid.update((current) => current + amount);
    } else {
      // Ensure we don't refund more than what was paid
      this.advancePaid.update((current) => current - amount);
    }

    this.showPaymentSidebar.set(false);
    console.log(`Transaction: ${this.payType()} | ₹${amount} | Mode: ${formValue.mode}`);
  }
  public today = new Date();
  finalizeBill() {
    if (this.balanceDue() > 0) {
      alert(`Payment Outstanding: ₹${this.balanceDue()}. Please settle before discharge.`);
    } else {
      alert('Billing Cleared. Generating Invoice...');
      window.print();
    }
  }
}
