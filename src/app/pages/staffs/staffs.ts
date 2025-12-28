import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Supabase } from '../../services/supabase';
import { FormsModule } from '@angular/forms';
import { Toaster } from '../../services/toaster';
@Component({
  selector: 'app-staffs',
  imports: [CommonModule, FormsModule],
  templateUrl: './staffs.html',
  styleUrl: './staffs.css',
})
export class Staffs implements OnInit {
  isLoading = signal(false);
  staffList = signal<any[]>([]);
  public supabase = inject(Supabase);
  showForm = signal(false);
  async ngOnInit() {
    await this.loadStaffData();
  }

  async loadStaffData() {
    this.isLoading.set(true); // 1. Start Loader
    try {
      const dummyStaff = [
        {
          id: 1,
          full_name: 'Dr. Jay Lakkoju',
          role: 'Chief Admin',
          department: 'Management',
          email: 'jay@hms.com',
          status: 'On Duty',
        },
        {
          id: 2,
          full_name: 'Dr. Sarah Smith',
          role: 'Cardiologist',
          department: 'Cardiology',
          email: 'sarah.s@hms.com',
          status: 'On Duty',
        },
        {
          id: 3,
          full_name: 'Robert Wilson',
          role: 'Head Nurse',
          department: 'Emergency',
          email: 'robert.w@hms.com',
          status: 'On Break',
        },
        {
          id: 4,
          full_name: 'Emily Chen',
          role: 'Receptionist',
          department: 'Front Desk',
          email: 'emily.c@hms.com',
          status: 'On Duty',
        },
        {
          id: 5,
          full_name: 'Dr. Michael Ross',
          role: 'Neurologist',
          department: 'Neurology',
          email: 'm.ross@hms.com',
          status: 'On Duty',
        },
      ];

      this.staffList.set(dummyStaff);
      const { data, error } = await this.supabase.client.from('staffs').select('*');

      // if (data) {
      //   this.staffList.set(data); // 2. Set Data
      // }
    } finally {
      this.isLoading.set(false); // 3. Hide Loader (even if it fails)
    }
  }
  constructor(private toaster: Toaster) {}
  saveStaff(formData: any) {
    this.toaster.show('Payment Processed Successfully!', 'success');
    console.log('Form Captured:', formData);
    // We will add Supabase integration here later
    this.showForm.set(false);
  }
}
