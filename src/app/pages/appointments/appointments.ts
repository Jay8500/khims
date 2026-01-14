import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Supabase } from '../../services/supabase';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  time: string;
  date: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.html',
})
export class Appointments implements OnInit {
  private supabase = inject(Supabase);

  // State
  showBookingSidebar = signal(false);
  selectedDate = signal(new Date().toISOString().split('T')[0]);
  appointments = signal<any[]>([]);
  doctorList = signal<any[]>([]);

  // Search State
  patientSearchResults = signal<any[]>([]);
  selectedPatientForBooking = signal<any>(null);

  async ngOnInit() {
    // 1. Check if we have the Hospital ID. If not, wait for it.
    if (!this.supabase.currentHospitalId()) {
      console.log('Waiting for tenant initialization...');
      await this.supabase.initializeTenant();
    }

    // 2. Now that we definitely have the ID, load everything
    await Promise.all([this.loadAppointments(), this.loadDoctors()]);
  }

  async loadDoctors() {
    const h_id = this.supabase.currentHospitalId();
    if (!h_id) return;

    const res = await this.supabase.getStaffDirectory(h_id);
    if (res.data) {
      // Log for debugging
      console.log('Doctors loaded:', res.data.length);

      const doctors = res.data.filter((s: any) => s.role_name?.toLowerCase().includes('doctor'));
      this.doctorList.set(doctors);
    }
  }

  async loadAppointments() {
    const res = await this.supabase.getAppointmentsByDate(this.selectedDate());
    if (res.statusCode === 200) this.appointments.set(res.data);
  }

  async onPatientSearch(event: any) {
    const term = event.target.value;
    if (term.length > 2) {
      const { data } = await this.supabase.searchPatients(term);
      this.patientSearchResults.set(data || []);
    } else {
      this.patientSearchResults.set([]);
    }
  }

  selectPatient(patient: any) {
    this.selectedPatientForBooking.set(patient);
    this.patientSearchResults.set([]);
  }

  async addAppointment(formValue: any) {
    if (!this.selectedPatientForBooking()) return alert('Please select a patient');

    const payload = {
      patient_id: this.selectedPatientForBooking().id,
      doctor_id: formValue.doctor_id,
      appointment_date: formValue.date,
      appointment_time: formValue.time,
      status: 'Scheduled',
    };

    const res = await this.supabase.saveAppointment(payload);
    if (res.statusCode === 200) {
      this.showBookingSidebar.set(false);
      this.selectedPatientForBooking.set(null);
      await this.loadAppointments();
    }
  }
}
