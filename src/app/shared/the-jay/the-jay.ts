import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Branding } from '../../services/branding';
@Component({
  selector: 'app-the-jay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './the-jay.html',
  styleUrl: './the-jay.css',
})
export class TheJay {
  branding = inject(Branding);
// Define a temporary object to hold chat-entered stock
tempStock = { name: '', qty: 0, price: 0, category: 'Tablet' };
  isOpen = signal(false);
  currentStep = signal('home'); // home, askingName, askingQty, etc.
  messages = signal<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: 'Good day! I am TheJay. How can I assist your workflow?' },
  ]);

  userInput = '';
  services = ['Inventory', 'Staff', 'Department', 'Designation', 'Blood Group'];

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
    }, 500);
  }

  handleInput() {
    if (!this.userInput.trim()) return;

    const val = this.userInput;
    this.messages.update((m) => [...m, { role: 'user', text: val }]);
    this.userInput = '';

    // Logic for "Super Minified" Inventory Adding
    if (this.currentStep() === 'inv_name') {
      this.currentStep.set('inv_qty');
      this.botReply(`Got it. How many units of ${val} are we adding?`);
    } else if (this.currentStep() === 'inv_qty') {
      this.currentStep.set('home');
      this.botReply(`Perfect! I've queued that into the database. Anything else?`);
      // Here is where you will call Supabase later
    }
  }
}
