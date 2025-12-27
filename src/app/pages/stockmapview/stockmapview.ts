import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Branding } from '../../services/branding';
@Component({
  selector: 'app-stockmapview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stockmapview.html',
  styleUrl: './stockmapview.css',
})
export class Stockmapview {
  branding = inject(Branding);
  // This data will eventually come from your Supabase Inventory table
  inventoryTree = signal([
    {
      id: 1,
      name: 'Tablets',
      count: 450,
      status: 'healthy',
      icon: '💊',
      pos: 'top: 15%; left: 20%;',
    },
    {
      id: 2,
      name: 'Injections',
      count: 12,
      status: 'low',
      icon: '💉',
      pos: 'top: 10%; right: 25%;',
    },
    {
      id: 3,
      name: 'Surgical',
      count: 156,
      status: 'healthy',
      icon: '🩹',
      pos: 'bottom: 20%; left: 25%;',
    },
    {
      id: 4,
      name: 'Syrups',
      count: 89,
      status: 'healthy',
      icon: '🧪',
      pos: 'bottom: 15%; right: 20%;',
    },
  ]);
}
