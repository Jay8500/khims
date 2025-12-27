import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class Appointments {
  // 1. UI State
  showBookingSidebar = signal(false);
  selectedDate = signal(new Date().toISOString().split('T')[0]); // Defaults to today: 2025-12-28

  // 2. Data
  doctors = [
    { name: 'Dr. Khanna', specialty: 'Cardiology' },
    { name: 'Dr. Reddy', specialty: 'Orthopedics' },
    { name: 'Dr. Sharma', specialty: 'General Physician' },
  ];

  appointments = signal<Appointment[]>([
    {
      id: '1',
      patientName: 'Alice Smith',
      doctorName: 'Dr. Khanna',
      specialty: 'Cardiology',
      time: '10:00',
      date: '2025-12-28',
      status: 'Scheduled',
    },
  ]);

  // 3. Computed Filter (The Magic)
  filteredAppointments = computed(() => {
    return this.appointments().filter((a) => a.date === this.selectedDate());
  });

  // 4. Methods
  addAppointment(formValue: any) {
    const newAppt: Appointment = {
      id: 'APP-' + Date.now(),
      patientName: formValue.patientName,
      doctorName: formValue.doctorName,
      specialty: this.doctors.find((d) => d.name === formValue.doctorName)?.specialty || 'General',
      time: formValue.time,
      date: formValue.date,
      status: 'Scheduled',
    };

    this.appointments.update((prev) => [...prev, newAppt]);
    this.selectedDate.set(formValue.date); // Auto-jump to the date of the new booking
    this.showBookingSidebar.set(false);
  }

  cancelAppointment(id: string) {
    this.appointments.update((list) => list.filter((a) => a.id !== id));
  }
}
