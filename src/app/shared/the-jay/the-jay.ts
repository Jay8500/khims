import { Component, signal, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Branding } from '../../services/branding';
import { Supabase } from '../../services/supabase';
@Component({
  selector: 'app-the-jay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './the-jay.html',
  styleUrl: './the-jay.css',
})
export class TheJay implements AfterViewChecked {
  @ViewChild('scrollFrame') private scrollContainer!: ElementRef;
  private supabase = inject(Supabase);
  branding = inject(Branding);
  // Define a temporary object to hold chat-entered stock
  tempStock = { name: '', qty: 0, price: 0, category: 'Tablet' };
  isOpen = signal(false);
  currentStep = signal('home'); // home, askingName, askingQty, etc.
  messages = signal<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: 'Good day! I am TheJay. How can I assist your workflow?' },
  ]);

  tempInventory = {
    name: '',
    category: 'Tablet',
    unit: '',
    stock: 0,
    price: 0,
    prescription_notes: '',
    order_date: '',
    received_date: '',
    vendor_name: '',
    vendor_mobile: '',
    gst_no: '',
    vendor_address: '',
    expiry: '',
  };

  userInput = '';
  services = ['Inventory'];//'Staff', 'Department', 'Designation', 'Blood Group'//];

  toggleChat() {
    this.isOpen.update((v) => !v);
  }

  selectService(service: string) {
    this.messages.update((m) => [...m, { role: 'user', text: `Add ${service}` }]);

    if (service === 'Inventory') {
      this.currentStep.set('inv_name');
      this.botReply('Great. What is the Medicine Name?');
    }
    // Add other service start points here
  }

  botReply(text: string) {
    setTimeout(() => {
      this.messages.update((m) => [...m, { role: 'bot', text }]);
      this.scrollToBottom();
    }, 500);
  }

  handleInput() {
    if (!this.userInput.trim()) return;
    const val = this.userInput;
    this.messages.update((m) => [...m, { role: 'user', text: val }]);
    this.userInput = '';

    const step = this.currentStep();

    if (step === 'inv_name') {
      this.tempInventory.name = val;
      this.currentStep.set('inv_cat');
      this.botReply(`Medicine: ${val}. What is the Category? (Tablet, Syrup, Injection, Ointment)`);
    } else if (step === 'inv_cat') {
      this.tempInventory.category = val;
      this.currentStep.set('inv_unit');
      this.botReply(`Unit type? (e.g., Tabs, Vial, Bottle)`);
    } else if (step === 'inv_unit') {
      this.tempInventory.unit = val;
      this.currentStep.set('inv_qty');
      this.botReply(`Quantity of ${this.tempInventory.name} to add?`);
    } else if (step === 'inv_qty') {
      this.tempInventory.stock = Number(val);
      this.currentStep.set('inv_price');
      this.botReply(`Unit Price (₹)?`);
    } else if (step === 'inv_price') {
      this.tempInventory.price = Number(val);
      this.currentStep.set('inv_expiry');
      this.botReply(`Expiry Date? (YYYY-MM-DD)`);
    } else if (step === 'inv_expiry') {
      this.tempInventory.expiry = val;
      this.currentStep.set('inv_vendor');
      this.botReply(`Vendor Name? (Type 'none' to skip)`);
    } else if (step === 'inv_vendor') {
      this.tempInventory.vendor_name = val;
      this.currentStep.set('inv_vendor_gst');
      this.botReply(`Vendor GST Number? (Type 'none' to skip)`);
    } else if (step === 'inv_vendor_gst') {
      this.tempInventory.gst_no = val === 'none' ? '' : val;
      this.currentStep.set('inv_final');
      this.botReply(`Any specific Prescription Notes?`);
    } else if (step === 'inv_final') {
      this.tempInventory.prescription_notes = val;
      // ఆటోమేటిక్ గా ఈరోజు డేట్స్ సెట్ చేస్తున్నాం (Order & Received)
      this.tempInventory.order_date = new Date().toISOString().split('T')[0];
      this.tempInventory.received_date = new Date().toISOString().split('T')[0];
      this.saveToSupabase();
    }
    this.scrollToBottom();
  }

  async saveToSupabase() {
    this.botReply(`Saving all details to Inventory... ⏳`);
    const res: any = await this.supabase.saveInventoryItem(this.tempInventory);
    if (res.status === 'Success') {
      this.botReply(
        `✅ Successfully Registered: ${this.tempInventory.name}\nStock: ${this.tempInventory.stock}\nVendor: ${this.tempInventory.vendor_name}`,
      );
      this.currentStep.set('home');
    } else {
      this.botReply(`❌ Error saving data. Please check if fields are correct.`);
    }
  }

  handleQuickInput(value: string) {
    this.userInput = value;
    this.handleInput();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      // setTimeout వాడటం వల్ల DOM అప్‌డేట్ అయ్యాక స్క్రోల్ జరుగుతుంది
      setTimeout(() => {
        this.scrollContainer.nativeElement.scrollTo({
          top: this.scrollContainer.nativeElement.scrollHeight,
          behavior: 'smooth',
        });
      }, 50); // 50ms గ్యాప్ ఇవ్వండి
    } catch (err) {}
  }
}
