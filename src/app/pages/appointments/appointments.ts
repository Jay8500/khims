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
    await Promise.all([this.loadAppointments(), this.loadDoctors(), this.loadLabTests()]);
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
    try {
      const res = await this.supabase.getAppointmentsByDate(this.selectedDate());
      // Ensure data is always an array, even if the DB returns null
      if (res && res.statusCode === 200) {
        this.appointments.set(res.data || []);
      } else {
        this.appointments.set([]);
      }
    } catch (err) {
      this.appointments.set([]);
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

  async loadLabTests() {
    const res = await this.supabase.getLabTests();
    if (res.statusCode === 200) {
      this.labTestMaster.set(res.data || []);
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
    try {
      const latestAppt = this.appointments().find((a) => a.id === appt.id);
      const rawLab = latestAppt?.labStatus?.[0] || null;

      if (rawLab) {
        const resultsData = rawLab.lab_results?.[0]?.results_data || {};
        const resultValues = Object.values(resultsData); // ["12", "45"]
        const processedLab = {
          status: rawLab.status,
          id: rawLab.id,
          // 2. ప్రతి ఐటమ్ కి రిజల్ట్ ని అటాచ్ చేయండి
          lab_order_items: rawLab.lab_order_items?.map((item: any, index: number) => ({
            ...item,
            displayResult: resultValues[index] || 'Pending',
          })),
          results: resultsData,
        };
        // 3. ఇక్కడ సిగ్నల్ అప్‌డేట్ చేయండి
        this.selectedAppt.set({ ...latestAppt, processedLab });
      } else {
        this.selectedAppt.set({ ...latestAppt, processedLab: null });
      }

      // Sidebar ఓపెన్ చేసినప్పుడు డీఫాల్ట్‌గా 'labs' లేదా 'billing' సెట్ చేయవచ్చు
    } catch (e) {
    }
    this.activeSidebarTab.set('labs');
    this.showDetailedSidebar.set(true);
  }

  async generateBill() {
    const appt = this.selectedAppt();
    const h_id = this.supabase.currentHospitalId();
    if (!appt || !h_id) return;

    // Set loading state if you have one
    try {
      const billingPayload = {
        appointment_id: appt.id,
        patient_id: appt.patient_id,
        hospital_id: h_id,
        total_amount: 50.0,
        payment_status: 'Paid',
        billed_by: this.supabase.currentUser()?.id, // Track who did the billing
      };

      const billRes = await this.supabase.saveBilling(billingPayload);

      if (billRes.statusCode === 200) {
        // Update Appointment Status
        await this.supabase.updateAppointmentStatus(appt.id, 'Completed');

        // Update Local State without a full reload for "Fast" feel
        this.appointments.update((list) =>
          list.map((a) => (a.id === appt.id ? { ...a, status: 'Completed' } : a)),
        );

        this.showDetailedSidebar.set(false);
        // Optional: Trigger a success toast instead of a blocking alert
      }
    } catch (err) {
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
      // 1. Update the list
      this.appointments.update((all) =>
        all.map((a) => (a.id === currentAppt.id ? { ...a, vitals: updatedVitals } : a)),
      );

      // 2. Set the selected appt with new vitals
      this.selectedAppt.set({ ...currentAppt, vitals: updatedVitals });

      // 3. Close Triage and open Details
      this.showVitalsSidebar.set(false);

      // Add a tiny delay so the "slide out" finishes before the next "slide in"
      setTimeout(() => {
        this.activeSidebarTab.set('summary'); // Reset to summary tab
        this.showDetailedSidebar.set(true);
      }, 100);
    }
  }

  // Add a signal to track selected tests in your class
  selectedTests = signal<string[]>([]);

  async submitLabOrders() {
    const appt = this.selectedAppt();
    const testIds = this.selectedTests(); // Array of UUIDs

    if (testIds.length === 0) return alert('Select at least one test');

    try {
      // STEP 1: Create the Main Lab Order
      const orderPayload = {
        patient_id: appt.patient_id,
        appointment_id: appt.id,
        status: 'Pending',
        priority: 'Routine',
        created_by: this.supabase.currentUser()?.id,
      };
      // Note: Calling a custom supabase method that handles the logic
      const res = await this.supabase.createFullLabOrder(orderPayload, testIds);

      if (res.statusCode === 200) {
        this.selectedTests.set([]);
        this.activeSidebarTab.set('summary');
        alert('Lab order created successfully!');
      }
    } catch (err) {
    }
  }

  labTestMaster = signal<any[]>([]);

  toggleTest(testId: string) {
    this.selectedTests.update((tests) =>
      tests.includes(testId) ? tests.filter((id) => id !== testId) : [...tests, testId],
    );
  }
}
