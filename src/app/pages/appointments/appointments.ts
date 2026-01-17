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
      await this.supabase.initializeTenant();
    }
    // Set the local signal from the service signal
    this.hospitalId.set(this.supabase.currentHospitalId());

    // 2. Now that we definitely have the ID, load everything
    await Promise.all([this.loadAppointments(), this.loadDoctors()]);
  }

  async loadDoctors() {
    const h_id = this.supabase.currentHospitalId();
    if (!h_id) return;

    const res = await this.supabase.getStaffDirectory(h_id);
    if (res.data) {
      // Log for debugging
      const doctors = res.data.filter((s: any) => s.role_name?.toLowerCase().includes('doctor'));
      this.doctorList.set(doctors);
    }
  }

  async loadAppointments() {
    const res = await this.supabase.getAppointmentsByDate(this.selectedDate());
    if (res.statusCode === 200) {
      this.appointments.set(res.data);
    }
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

  // Inside your Appointments class
  showVitalsSidebar = signal(false);
  selectedAppt = signal<any>(null);

  // Call this when Nurse clicks the button on a card
  openVitalsSidebar(appt: any) {
    this.selectedAppt.set(appt);
    this.showVitalsSidebar.set(true);
  }

  showDetailedSidebar = signal(false);

  activeSidebarTab = signal<'summary' | 'billing' | 'labs'>('summary');

  openDetailedSidebar(appt: any) {
    const latestAppt = this.appointments().find((a) => a.id === appt.id);
    console.log('Opening Sidebar for:', latestAppt); // <--- Debug here!
    this.selectedAppt.set(latestAppt || appt);
    this.showDetailedSidebar.set(true);
  }

  async generateBill() {
    const appt = this.selectedAppt();
    if (!appt) return;

    const billingPayload = {
      appointment_id: appt.id,
      patient_id: appt.patient_id,
      hospital_id: this.supabase.currentHospitalId(),
      total_amount: 50.0, // For now, a flat consultation fee
      payment_status: 'Paid',
    };

    // 1. Save Billing Record
    const billRes = await this.supabase.saveBilling(billingPayload);

    if (billRes.statusCode === 200) {
      // 2. Update Appointment Status to 'Completed'
      await this.supabase.updateAppointmentStatus(appt.id, 'Completed');

      // 3. UI Cleanup
      this.showDetailedSidebar.set(false);
      await this.loadAppointments(); // Refresh the grid to see the status change
      alert('Bill Generated Successfully!');
    }
  }
  hospitalId = signal<string | null>(null);

  async submitVitals(formData: any) {
    const currentAppt = this.selectedAppt();

    const vitalsPayload = {
      appointment_id: currentAppt.id,
      patient_id: currentAppt.patient_id,
      temp_c: formData.temp,
      blood_pressure: formData.bp,
      pulse_rate: formData.pulse,
      sp_o2: formData.spo2,
    };

    const response = await this.supabase.saveVitals(vitalsPayload);

    if (response.statusCode === 200) {
      // FIX: Match the variable name and ensure it's an object
      const updatedVitals = Array.isArray(response.data) ? response.data[0] : response.data;

      // Update the main list signal
      this.appointments.update((all) =>
        all.map((a) => (a.id === currentAppt.id ? { ...a, vitals: updatedVitals } : a))
      );

      // Force update the selectedAppt signal
      this.selectedAppt.set({ ...currentAppt, vitals: updatedVitals });

      this.showVitalsSidebar.set(false);

      // Refresh detailed sidebar
      this.openDetailedSidebar(this.selectedAppt());
    }
  }
}
