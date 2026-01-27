import { Component, inject, OnInit, signal } from '@angular/core';
import { Supabase } from '../../services/supabase';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// 1. Define the "Frame" (Interface)
interface Patient {
  id?: number;
  uhid: string;
  p_name: string;
  age: number;
  gender: string;
  blood: string;
  phone: string;
  complaint?: string;
  admission_type?: string;
  dept?: string;
  labResults?: {
    hb: number;
    wbc: number;
    remarks?: string;
  };
}
@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.html'
})
export class Patients implements OnInit {
  public supabase = inject(Supabase);
  // 2. Initialize the signal with the type <Patient | null>
  public selectedPatient = signal<Patient | null>(null);
  // MUST BE PUBLIC for the HTML to see them
  public isLoading = signal(false);
  public showPatientForm = signal(false);
  public patientList = signal<any[]>([]);
  public showHistory = signal(false);
  // 1. Add new signals for visibility
  public showVitalsForm = signal(false);
  public showLabForm = signal(false);
  public showPharmacyForm = signal(false);

  async ngOnInit() {
    // Start with a clean state
    this.showPatientForm.set(false);
    await this.loadPatients();
  }

  async loadPatients() {
    this.isLoading.set(true);
    const res = await this.supabase.getPatients();
    if (res.statusCode === 200) {
      this.patientList.set(res.data);
    }
    // ... your fetch logic ...
    this.isLoading.set(false);
  }

  async savePatient(data: any) {
    this.isLoading.set(true);
    const res = await this.supabase.savePatient(data);
    if (res.statusCode === 200) {
      await this.loadPatients(); // Refresh list
      this.showPatientForm.set(false);
    } else {
      alert(res.message);
    }
    this.isLoading.set(false);
  }

  openHistory(patient: any) {
    this.selectedPatient.set(patient);
    this.showHistory.set(true);
  }

  openVitals(patient: any) {
    this.selectedPatient.set(patient);
    this.showVitalsForm.set(true);
  }

  openLab(patient: any) {
    this.selectedPatient.set(patient);
    this.showLabForm.set(true);
  }

  saveVitals(data: any) {
    console.log('Saving Vitals for:', this.selectedPatient()?.p_name, data);
    // Here you would call: this.supabase.from('vitals').insert(...)

    this.showVitalsForm.set(false);
    // Optional: Trigger a success toast
  }

  saveLabRequest(formData: any) {
    const patient = this.selectedPatient();
    if (!patient) return;

    // Lead Tip: Map checkboxes into an array of test names for the database
    const selectedTests = Object.keys(formData).filter(
      (key) => formData[key] === true && key !== 'priority'
    );

    console.log(`🚀 Lab Order Created for ${patient.p_name}:`, {
      tests: selectedTests,
      priority: formData.priority,
      orderDate: new Date().toISOString(),
    });

    // Close sidebar
    this.showLabForm.set(false);
  }

  openPharmacy(patient: any) {
    this.selectedPatient.set(patient);
    this.showPharmacyForm.set(true);
  }

  // 3. Save Handler with Guard Clause
  savePrescription(formData: any) {
    const patient = this.selectedPatient();
    if (!patient) return;

    // Lead Tip: Map this to your 'prescriptions' table in Supabase
    const prescriptionPayload = {
      patient_id: patient.uhid,
      medication: formData.drug_name,
      dosage: formData.frequency,
      days: formData.duration,
      instructions: formData.notes,
      prescribed_at: new Date().toISOString(),
    };

    console.log('💊 Prescription Issued:', prescriptionPayload);

    // Close and Reset
    this.showPharmacyForm.set(false);
  }

  // 1. Ensure these are defined at the TOP of your class
  labQueue = signal<any[]>([]); // Your list of lab orders
  showResultEntry = signal(false); // Controls the entry drawer
  selectedOrder = signal<any>(null); // The order currently being filled

  authorizeResults(resultsData: any) {
    const order = this.selectedOrder();
    if (!order) return;

    // 1. Update the Patient Signal Immutably
    this.patientList.update((patients) =>
      patients.map((p) => (p.uhid === order.uhid ? { ...p, labResults: resultsData } : p))
    );

    // 2. Remove from Lab Queue (Fixes the "labqueue" error)
    this.labQueue.update((orders) => orders.filter((o) => o.id !== order.id));

    // 3. Close the Modal (Fixes the "showResultEntry" error)
    this.showResultEntry.set(false);
    this.selectedOrder.set(null);
  }
}
