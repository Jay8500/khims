import { inject, Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ApiResponse } from '../models/api-response.model';
@Injectable({
  providedIn: 'root',
})
export class Supabase {
  private supabase: SupabaseClient;
  private router = inject(Router);
  // 1. New Signal for Duplicate Session Detection
  public isDuplicateTab = signal(false);
  private sessionChannel = new BroadcastChannel('hms_session_guard');
  public currentUser = signal<any>(null); // Added this
  public currentMenuModules = signal<any[]>([]);
  // --- NEW TENANT STATE ---
  public currentTenant = signal<any>(null); // Stores Name, Logo, Brand Color
  public currentHospitalId = signal<string | null>(null); // Stores the UUID
  // -------------------------

  constructor() {
    // Use dot notation (no brackets, no quotes)
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    // Initial check on load
    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUser.set(data.session?.user ?? null);
      this.initializeTenant();
    });
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.set(session?.user ?? null); // Keep signal in sync
      if (event === 'SIGNED_OUT') {
        // If the user is logged out, force them to the login page
        this.router.navigate(['/login']);
      }
    });
    this.initSessionGuard();
  }

  /**
   * Automatically detects tenant from URL Slug
   * Example: /apollo/dashboard -> 'apollo'
   */
  async initializeTenant() {
    const urlParams = new URLSearchParams(window.location.search);
    const pathSlug = window.location.pathname.split('/')[1];

    // 1. Priority: URL Param (?h=) > URL Path (/apollo) > Last Saved > Default
    // const slug = urlParams.get('h') ||
    //              (pathSlug !== 'login' ? pathSlug : null) ||
    //              localStorage.getItem('preferred_tenant') ||
    //              'apollo';

    // 2. Save it for later (so it survives login/redirects)
    localStorage.setItem('preferred_tenant', 'Care Clinic');

    const { data, error } = await this.supabase.rpc('get_hospital_by_slug', {
      p_slug: 'Care Clinic', //slug
    });

    if (data?.statusCode === 200) {
      this.currentTenant.set(data.data);
      localStorage.setItem('tenant_info', JSON.stringify(this.currentTenant()));
      this.currentHospitalId.set(data.data.id);
      // console.log(`Initialized Tenant: ${data.data.name}`);
      this.refreshMenu();
    }
  }

  async refreshMenu() {
    const res = await this.getSidebarMenu();
    if (res.statusCode === 200) {
      this.currentMenuModules.set(res.data);
    }
  }

  private tabId = Math.random().toString(36).substring(7);
  get hasActiveSession(): boolean {
    return !!this.currentUser();
  }
  private async initSessionGuard() {
    this.sessionChannel.onmessage = async (event) => {
      // 1. Get the current session
      const { data } = await this.supabase.auth.getSession();

      // 2. Only run the guard if a user is actually logged in
      if (!data.session) return;

      if (event.data.type === 'new_hms_tab_opened' && event.data.from !== this.tabId) {
        this.isDuplicateTab.set(true);
        this.sessionChannel.postMessage({
          type: 'existing_tab_confirmed',
          from: this.tabId,
        });
      }

      if (event.data.type === 'existing_tab_confirmed' && event.data.from !== this.tabId) {
        this.isDuplicateTab.set(true);
      }
    };

    // Announce ourselves only after a short delay
    setTimeout(() => {
      this.sessionChannel.postMessage({
        type: 'new_hms_tab_opened',
        from: this.tabId,
      });
    }, 1000); // Increased to 1s for better stability during redirects
  }
  // Use this to get the client in components
  get client() {
    return this.supabase;
  }

  // Helper for Auth
  get auth() {
    return this.supabase.auth;
  }

  /**
   * 1. GET SIDEBAR MENU (RPC CALL)
   * Now passing the User UUID to filter by Role Permissions
   */
  async getSidebarMenu(): Promise<ApiResponse<any[]>> {
    try {
      // 1. Get the current user from the signal
      const user = this.currentUser();

      if (!user) {
        throw new Error('No active session found');
      }

      // 2. Pass the user ID as 'p_auth_id' to match the SQL function parameter
      const { data, error } = await this.supabase.rpc('get_sidebar_menu', {
        p_auth_id: user.id,
      });

      if (error) throw error;

      return data as ApiResponse<any[]>;
    } catch (err: any) {
      return {
        statusCode: 500,
        message: err.message || 'Failed to fetch sidebar menu',
        data: [],
      };
    }
  }
  /**
   * 2. GENERIC INSERT WRAPPER (For future use with TheJay or Forms)
   * Use this for Staff, Inventory, etc.
   */
  async insertRecord<T>(tableName: string, payload: T): Promise<ApiResponse<T | null>> {
    const { data, error } = await this.supabase.from(tableName).insert(payload).select().single();

    if (error) {
      return { statusCode: 400, message: error.message, data: null };
    }

    return {
      statusCode: 200,
      message: `${tableName} record created successfully`,
      data: data,
    };
  }

  /**
   * 3. STAFF PROFILE METHODS
   */

  // Fetches both Departments and Roles for dropdowns
  async getStaffFormMasters(
    currentHospitalId: string,
  ): Promise<ApiResponse<{ departments: any[]; roles: any[] }>> {
    try {
      // console.log("this.currentHospitalId ",this.currentHospitalId0)
      const { data, error } = await this.supabase.rpc('get_staff_form_masters', {
        _h_id: this.currentHospitalId(), // <--- This MUST match the SQL parameter name now
      });

      if (error) throw error;
      return data as ApiResponse<any>;
    } catch (err: any) {
      return {
        statusCode: 500,
        message: err.message || 'Failed to fetch masters',
        data: [],
      };
    }
  }

  // Calls the RPC we created to save/update staff
  async upsertStaffProfile(payload: any): Promise<ApiResponse<null>> {
    const { data, error } = await this.supabase.rpc('upsert_staff_profile', payload);
    if (error) return { statusCode: 400, message: error.message, data: null };
    return { statusCode: 200, message: 'Staff profile updated successfully', data: null };
  }

  // Fetches the directory for the cards
  async getStaffDirectory(hospitalId: string): Promise<ApiResponse<any[]>> {
    const { data, error } = await this.supabase.rpc('get_hospital_staff', {
      p_hospital_id: this.currentHospitalId(),
    });
    if (error) return { statusCode: 500, message: error.message, data: [] };
    return { statusCode: 200, message: 'Success', data: data };
  }

  // Add to your Supabase service
  async getRolePermissions(roleId: number): Promise<ApiResponse<any[]>> {
    // This query gets all documents and checks if they exist in the permissions table for this role
    const { data, error } = await this.supabase
      .from('hms_documents')
      .select(
        `
      doc_id, doc_name,
      hms_role_permissions(role_id)
    `,
      )
      .eq('hms_role_permissions.role_id', roleId);

    if (error) return { statusCode: 500, message: error.message, data: [] };

    // Transform data to have a simple 'hasAccess' boolean
    const formatted = data.map((doc: any) => ({
      doc_id: doc.doc_id,
      doc_name: doc.doc_name,
      hasAccess: doc.hms_role_permissions.length > 0,
    }));

    return { statusCode: 200, message: 'Success', data: formatted };
  }

  async updatePermission(roleId: number, docId: string, state: boolean) {
    return await this.supabase.rpc('toggle_permission', {
      p_role_id: roleId,
      p_doc_id: docId,
      p_state: state,
    });
  }

  getTenantInfo() {
    let tntInfo = null;
    let getTenantInfo: any = localStorage.getItem('tenant_info');
    if (getTenantInfo) {
      getTenantInfo = JSON.parse(getTenantInfo);
      tntInfo = getTenantInfo;
    }
    return tntInfo;
  }

  // --- IN YOUR supabase.ts ---

  // 1. Add the signal
  public currentProfile = signal<any>(null);

  // 2. Add this method to fetch the detailed profile
  async fetchUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('staff_profiles')
      .select(
        `
      full_name,
      roles (role_name),
      departments (name)
    `,
      )
      .eq('id', userId)
      .single();

    if (data) {
      this.currentProfile.set(data);
    }
    // console.log("err ",error)
  }
  // --- IN YOUR supabase.ts ---

  // Update this in your supabase.ts
  async getPatients(): Promise<ApiResponse<any[]>> {
    // 1. Force a check: Is the hospital ID actually set?
    let h_id = this.currentHospitalId();

    // 2. If it's missing, try to re-initialize once
    if (!h_id || h_id === 'null') {
      await this.initializeTenant();
      h_id = this.currentHospitalId();
    }

    // 3. Final Guard: If still null, return empty to prevent the 22P02 crash
    if (!h_id || h_id === 'null') {
      console.error('Fetch blocked: Hospital ID is invalid.');
      return { statusCode: 200, message: 'Waiting for context...', data: [] };
    }

    const { data, error } = await this.supabase
      .from('patients')
      .select(
        `
      *,
      departments (name)
    `,
      )
      .eq('hospital_id', h_id)
      .order('created_at', { ascending: false });

    if (error) return { statusCode: 500, message: error.message, data: [] };
    return { statusCode: 200, message: 'Success', data: data };
  }
  async savePatient(payload: any): Promise<ApiResponse<any>> {
    // Inject the current tenant ID for security
    const finalPayload = {
      ...payload,
      hospital_id: this.currentHospitalId(),
    };

    const { data, error } = await this.supabase.rpc('upsert_patient', {
      p_data: finalPayload,
    });

    if (error) return { statusCode: 400, message: error.message, data: null };
    return data;
  }

  // --- IN YOUR Supabase Service ---
  // 2. Search patients for the lookup
  async searchPatients(query: string) {
    return await this.supabase
      .from('patients')
      .select('id, p_name, uhid, phone')
      .eq('hospital_id', this.currentHospitalId())
      .ilike('p_name', `%${query}%`)
      .limit(5);
  }

  // 3. Save Appointment
  async saveAppointment(payload: any) {
    const { error } = await this.supabase.from('appointments').insert({
      ...payload,
      hospital_id: this.currentHospitalId(),
      created_by: this.currentUser()?.id,
    });
    return error ? { statusCode: 400, message: error.message } : { statusCode: 200 };
  }

  async saveVitals(payload: any): Promise<ApiResponse<any>> {
    const h_id = this.currentHospitalId();
    if (!h_id) return { statusCode: 401, message: 'Hospital context missing', data: null };

    // Use a unique name for the internal supabase result
    const result = await this.supabase
      .from('patient_vitals')
      .insert({
        ...payload,
        hospital_id: h_id,
        recorded_by: this.currentUser()?.id,
      })
      .select()
      .single();

    if (result.error) {
      return { statusCode: 400, message: result.error.message, data: null };
    }

    return { statusCode: 200, message: 'Success', data: result.data };
  }

  async getAppointmentsByDate(date: string): Promise<ApiResponse<any[]>> {
    const h_id = this.currentHospitalId();
    if (!h_id) return { statusCode: 404, message: 'Hospital ID not set', data: [] };

    const { data, error } = await this.supabase
      .from('appointments')
      .select(
        `
      id, 
      appointment_time, 
      status, 
      patient_id,
      patients (p_name, uhid),
      staff_profiles (id, full_name, departments (name)),
      patient_vitals (temp_c, blood_pressure, pulse_rate, sp_o2)
    `,
      )
      .eq('hospital_id', h_id)
      .eq('appointment_date', date)
      .order('appointment_time', { ascending: true });

    if (error) return { statusCode: 500, message: error.message, data: [] };
    // This formatting step is CRITICAL
    const formatted = data.map((a: any) => ({
      id: a.id,
      patient_id: a.patient_id,
      doctor_id: a.staff_profiles?.id,
      time: a.appointment_time.slice(0, 5), // Changes "05:52:00" to "05:52"
      patientName: a.patients?.p_name || 'Unknown', // Maps 'patients.p_name' to 'patientName'
      uhid: a.patients?.uhid,
      doctorName: a.staff_profiles?.full_name,
      specialty: a.staff_profiles?.departments?.name,
      status: a.status,
      // Supabase joins return arrays. We take the first vitals entry if it exists.
      vitals: Object.keys(a.patient_vitals).length > 0 ? a.patient_vitals : null,
    }));
    return { statusCode: 200, message: 'Success', data: formatted };
  }
  /**
   * 4. BILLING & WORKFLOW METHODS
   */

  // Saves the bill to the 'billing' table
  async saveBilling(payload: any): Promise<ApiResponse<any>> {
    const { data, error } = await this.supabase.from('billing').insert(payload).select().single();

    if (error) {
      return { statusCode: 400, message: error.message, data: null };
    }
    return { statusCode: 200, message: 'Bill generated successfully', data: data };
  }

  // Updates the appointment status (e.g., from 'Scheduled' to 'Completed')
  async updateAppointmentStatus(apptId: string, status: string): Promise<ApiResponse<any>> {
    const { data, error } = await this.supabase
      .from('appointments')
      .update({ status: status })
      .eq('id', apptId);

    if (error) {
      return { statusCode: 400, message: error.message, data: null };
    }
    return { statusCode: 200, message: 'Status updated', data: data };
  }
}
