import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface BillItem {
  description: string;
  category: 'Consultation' | 'Lab' | 'Pharmacy' | 'Ward';
  amount: number;
  date: string;
}

interface PatientBill {
  id: string;
  name: string;
  uhid: string;
  type: 'IP' | 'OP';
  items: BillItem[];
  advancePaid: number;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.html',
  styleUrl: './billing.css',
})
export class Billing {
  // Main Data Store
  allBills = signal<PatientBill[]>([
    {
      id: '1',
      name: 'John Doe',
      uhid: 'HOSP-772',
      type: 'IP',
      advancePaid: 2000,
      items: [
        {
          description: 'General Consultation',
          category: 'Consultation',
          amount: 500,
          date: '2023-10-01',
        },
        { description: 'CBC & Lipid Profile', category: 'Lab', amount: 1200, date: '2023-10-01' },
        { description: 'Semi-Private Room', category: 'Ward', amount: 4000, date: '2023-10-03' },
      ],
    },
    {
      id: '2',
      name: 'Sarah Smith',
      uhid: 'HOSP-885',
      type: 'OP',
      advancePaid: 5000,
      items: [
        {
          description: 'Dental Cleaning',
          category: 'Consultation',
          amount: 1500,
          date: '2023-10-05',
        },
        { description: 'X-Ray', category: 'Lab', amount: 800, date: '2023-10-05' },
      ],
    },
  ]);

  // UI State Signals
  selectedBill = signal<PatientBill | null>(null);
  showPaymentSidebar = signal(false);
  showNewInvoiceSidebar = signal(false);
  payType = signal<'advance' | 'refund'>('advance');
  searchTerm = signal('');

  // Computed Search
  filteredBills = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.allBills().filter(
      (b) => b.name.toLowerCase().includes(term) || b.uhid.toLowerCase().includes(term)
    );
  });

  // Calculation Logic
  calculateTotals(bill: PatientBill) {
    const subTotal = bill.items.reduce((acc, item) => acc + item.amount, 0);
    const tax = subTotal * 0.05;
    const grandTotal = subTotal + tax;
    const balanceDue = Math.max(0, grandTotal - bill.advancePaid);
    return { subTotal, tax, grandTotal, balanceDue };
  }

  // --- ACTIONS ---

  handlePayment(formValue: any) {
    const amount = Number(formValue.amount);
    const bill = this.selectedBill();
    if (!amount || !bill) return;

    this.allBills.update((bills) =>
      bills.map((b) => {
        if (b.id === bill.id) {
          const newTotal =
            this.payType() === 'advance' ? b.advancePaid + amount : b.advancePaid - amount;
          return { ...b, advancePaid: newTotal };
        }
        return b;
      })
    );
    this.showPaymentSidebar.set(false);
    this.selectedBill.set(null);
  }

  archiveBill(id: string) {
    if (confirm('Move this bill to records?')) {
      this.allBills.update((bills) => bills.filter((b) => b.id !== id));
    }
  }

  finalizeBill(bill: PatientBill) {
    const totals = this.calculateTotals(bill);
    if (totals.balanceDue > 0) {
      alert(`Pending Balance: ₹${totals.balanceDue}`);
    } else {
      window.print();
    }
  }

  public today = new Date();

  handleCreateInvoice(formValue: any) {
    const newBill: PatientBill = {
      id: Math.random().toString(36).substring(2, 9),
      name: formValue.name,
      uhid: `HOSP-${Math.floor(100 + Math.random() * 900)}`,
      type: formValue.type,
      advancePaid: formValue.advance || 0,
      items: [
        {
          description: 'Registration & Consultation',
          category: 'Consultation',
          amount: 500,
          date: new Date().toISOString().split('T')[0],
        },
      ],
    };

    this.allBills.update((bills) => [newBill, ...bills]);
    this.showNewInvoiceSidebar.set(false);
  }
}
