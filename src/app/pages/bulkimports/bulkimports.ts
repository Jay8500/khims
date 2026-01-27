import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Branding } from '../../services/branding';
@Component({
  selector: 'app-bulkimports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bulkimports.html'
})
export class Bulkimports {
  branding = inject(Branding);

  importType = signal('Doctors');
  status = signal<'idle' | 'loading' | 'success'>('idle');
  count = signal(0);

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (!file) return;

      this.status.set('loading');

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        this.processData(text);
      };
      reader.readAsText(file);
    }
  }

  parseCSV(csvText: string) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');

    // This is the array that will go to Supabase
    const payload = lines
      .slice(1)
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const values = line.split(',');
        return headers.reduce((obj: any, header, index) => {
          obj[header.trim()] = values[index]?.trim();
          return obj;
        }, {});
      });

    // THE AUDIT LOG: This is what you'll check in the browser
    console.log(
      `%c 🚀 DATA LOADED FOR: ${this.importType()}`,
      'color: #2563eb; font-weight: bold; font-size: 14px;'
    );
    console.table(payload); // Shows your data in a beautiful table format
    console.log('Final Payload for Supabase:', JSON.stringify(payload, null, 2));

    // Simulate Network Latency
    setTimeout(() => {
      this.count.set(payload.length);
      this.status.set('success');
    }, 1500);
  }

  processData(csvText: string) {
    this.status.set('loading');
    this.parseCSV(csvText);
    // Simulate "Bulk Insert" processing time
    setTimeout(() => {
      this.count.set(Math.floor(Math.random() * 450) + 50);

      this.status.set('success');
    }, 2500);
  }

  downloadTemplate() {
    const headers =
      this.importType() === 'Inventory'
        ? 'Item_Name,Batch_No,Expiry,Quantity\nParacetamol,B123,2026-01-01,1000'
        : 'Full_Name,Department,Email,License\nDr. Smith,ER,smith@hosp.com,MD992';

    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.importType()}_Template.csv`;
    a.click();
  }
}
