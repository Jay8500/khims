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

  constructor() {
    // Use dot notation (no brackets, no quotes)
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    // Initial check on load
    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUser.set(data.session?.user ?? null);
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
    currentHospitalId: string
  ): Promise<ApiResponse<{ departments: any[]; roles: any[] }>> {
    try {
      const { data, error } = await this.supabase.rpc('get_staff_form_masters', {
        _h_id: currentHospitalId, // <--- This MUST match the SQL parameter name now
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
      p_hospital_id: hospitalId,
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
    `
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
}
