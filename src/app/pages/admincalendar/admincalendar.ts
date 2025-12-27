import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Branding } from '../../services/branding';
@Component({
  selector: 'app-admincalendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admincalendar.html',
  styleUrl: './admincalendar.css',
})
export class Admincalendar {
  branding = inject(Branding);

  // Categorized Holiday List
  holidays = signal([
    { date: '2026-01-01', reason: 'New Year Celebration', type: 'Global', icon: '🎆' },
    { date: '2026-01-26', reason: 'Republic Day', type: 'National', icon: '🇮🇳' },
    { date: '2026-03-15', reason: 'Annual Staff Training', type: 'Internal', icon: '🎓' },
  ]);

  addHoliday(date: string, reason: string, type: string) {
    if (!date || !reason) return;

    const newHoliday = { date, reason, type, icon: this.getIcon(type) };
    this.holidays.update((prev) => [newHoliday, ...prev]);

    // THE AUDIT LOG: Check this in Console
    console.log('%c 🗓️ HOLIDAY ADDED TO SYSTEM', 'color: #e11d48; font-weight: bold;');
    console.table(this.holidays());
  }

  getIcon(type: string) {
    if (type === 'Global') return '🌍';
    if (type === 'National') return '🏛️';
    return '🏥';
  }
}
