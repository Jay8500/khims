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
  public supabase = inject(Supabase);
  currentHospitalId = '550e8400-e29b-41d4-a716-446655440000';
  // Signals for UI State
  departments = signal<any[]>([]);
  roles = signal<any[]>([]);
  staffList = signal<any[]>([]);

  showForm = signal(false);
  async ngOnInit() {
    await this.loadMasters();
    await this.loadStaffData();
  }

  async loadMasters() {
    // Pass the hospital ID to the RPC
    const res = await this.supabase.getStaffFormMasters(this.currentHospitalId);
    if (res.statusCode === 200) {
      this.departments.set(res.data.departments || []);
      this.roles.set(res.data.roles || []);
    }
  }

  async loadStaffData() {
    this.isLoading.set(true); // 1. Start Loader
    try {
      // const dummyStaff = [
      //   {
      //     id: 1,
      //     full_name: 'Dr. Jay Lakkoju',
      //     role: 'Chief Admin',
      //     department: 'Management',
      //     email: 'jay@hms.com',
      //     status: 'On Duty',
      //   },
      //   {
      //     id: 2,
      //     full_name: 'Dr. Sarah Smith',
      //     role: 'Cardiologist',
      //     department: 'Cardiology',
      //     email: 'sarah.s@hms.com',
      //     status: 'On Duty',
      //   },
      //   {
      //     id: 3,
      //     full_name: 'Robert Wilson',
      //     role: 'Head Nurse',
      //     department: 'Emergency',
      //     email: 'robert.w@hms.com',
      //     status: 'On Break',
      //   },
      //   {
      //     id: 4,
      //     full_name: 'Emily Chen',
      //     role: 'Receptionist',
      //     department: 'Front Desk',
      //     email: 'emily.c@hms.com',
      //     status: 'On Duty',
      //   },
      //   {
      //     id: 5,
      //     full_name: 'Dr. Michael Ross',
      //     role: 'Neurologist',
      //     department: 'Neurology',
      //     email: 'm.ross@hms.com',
      //     status: 'On Duty',
      //   },
      // ];

      const res = await this.supabase.getStaffDirectory(this.currentHospitalId);
      if (res.statusCode === 200) {
        this.staffList.set(res.data);
      }
      // this.staffList.set(dummyStaff);
      // const { data, error } = await this.supabase.client.from('staffs').select('*');

      // if (data) {
      //   this.staffList.set(data); // 2. Set Data
      // }
    } finally {
      this.isLoading.set(false); // 3. Hide Loader (even if it fails)
    }
  }
  constructor(private toaster: Toaster) {}

  async saveStaff(formData: any) {
    this.isLoading.set(true);

    try {
      // 1. Create the Auth User first
      // This creates the record in auth.users and returns the ID
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: formData.email,
        password: 'TemporaryPassword123!', // You can change this later
        options: {
          data: { full_name: formData.full_name },
        },
      });

      if (authError) {
        this.toaster.show(authError.message, 'error');
        return;
      }

      const newUserId = authData.user?.id;

      if (newUserId) {
        // 2. Now use that new ID to create the Staff Profile
        const payload = {
          p_id: newUserId,
          p_hospital_id: this.currentHospitalId,
          p_name: formData.full_name,
          p_role_id: formData.role_id,
          p_dept_id: formData.dept_id,
          p_email: formData.email,
        };

        const res = await this.supabase.upsertStaffProfile(payload);

        if (res.statusCode === 200) {
          this.toaster.show('Staff Registered & Auth Account Created!', 'success');
          await this.loadStaffData();
          this.showForm.set(false);
        }
      }
    } catch (error) {
      this.toaster.show('Error during registration', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }
}
