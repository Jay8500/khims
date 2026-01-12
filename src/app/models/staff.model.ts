export type StaffRole = 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Pharmacist';

export interface StaffProfile {
  id?: string;           // Supabase UUID
  full_name: string;
  role: StaffRole;
  department_id: string;
  mobile_no: string;
  email: string;
  is_active: boolean;
  created_at?: string;
}