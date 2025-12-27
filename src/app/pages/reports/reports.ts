import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports {
  // Mocking the Bed/Ward state
  wards = signal([
    { name: 'General Ward', totalBeds: 20, occupied: 15, rate: 1500 },
    { name: 'ICU', totalBeds: 5, occupied: 4, rate: 8000 },
    { name: 'Private Room', totalBeds: 10, occupied: 3, rate: 4500 },
  ]);

  // Total Hospital Occupancy Percentage
  occupancyRate = computed(() => {
    const total = this.wards().reduce((acc, w) => acc + w.totalBeds, 0);
    const full = this.wards().reduce((acc, w) => acc + w.occupied, 0);
    return Math.round((full / total) * 100);
  });

  // Financial Projection (Current daily revenue from beds)
  dailyBedRevenue = computed(() => this.wards().reduce((acc, w) => acc + w.occupied * w.rate, 0));
}
