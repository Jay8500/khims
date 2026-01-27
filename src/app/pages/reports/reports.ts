import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html'
})
export class Reports {
  // Enhanced Mock Data
  wards = signal([
    { name: 'General Ward', totalBeds: 20, occupied: 18, rate: 1500, category: 'Standard' },
    { name: 'ICU', totalBeds: 10, occupied: 9, rate: 8500, category: 'Critical' },
    { name: 'Private Room', totalBeds: 15, occupied: 4, rate: 4500, category: 'Premium' },
    { name: 'Emergency', totalBeds: 8, occupied: 7, rate: 2500, category: 'Critical' },
  ]);

  // Daily target for revenue
  dailyTarget = signal(150000);

  // Metrics
  occupancyRate = computed(() => {
    const total = this.wards().reduce((acc, w) => acc + w.totalBeds, 0);
    const full = this.wards().reduce((acc, w) => acc + w.occupied, 0);
    return Math.round((full / total) * 100);
  });

  dailyBedRevenue = computed(() => this.wards().reduce((acc, w) => acc + w.occupied * w.rate, 0));

  revenuePerformance = computed(() => {
    return Math.round((this.dailyBedRevenue() / this.dailyTarget()) * 100);
  });

  // Critical Alerts (Blinker Logic)
  criticalWards = computed(() => this.wards().filter((w) => w.occupied / w.totalBeds >= 0.9));
  showDatePicker = signal(false);
  selectedDate = signal(new Date().toISOString().split('T')[0]);

  // Mock function to simulate "fetching" data for a specific date
  changeDate(newDate: string) {
    this.selectedDate.set(newDate);
    this.showDatePicker.set(false);
    // In a real app, you'd call: this.reportService.getDataForDate(newDate)
    console.log('Loading report for:', newDate);
  }

  downloadPDF() {
    // Simple trigger for browser print (configured via CSS to look like a report)
    window.print();
  }
}
