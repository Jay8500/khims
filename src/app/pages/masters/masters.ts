import { Component, inject, signal, effect } from '@angular/core';
import { Supabase } from '../../services/supabase';
@Component({
  selector: 'app-masters',
  imports: [],
  templateUrl: './masters.html',
  styleUrl: './masters.css',
})
export class Masters {
supabase = inject(Supabase);
  roles = signal<any[]>([]);
  selectedRoleId = signal<number | null>(null);
  permissions = signal<any[]>([]);

  constructor() {
    this.loadRoles();
    
    // Auto-reload permissions when role changes
    effect(async () => {
      const roleId = this.selectedRoleId();
      if (roleId) {
        const res = await this.supabase.getRolePermissions(roleId);
        this.permissions.set(res.data);
      }
    });
  }

  async loadRoles() {
    const { data } = await this.supabase.client.from('roles').select('*');
    this.roles.set(data || []);
  }

  async onToggle(docId: string, event: any) {
    const isChecked = event.target.checked;
    const roleId = this.selectedRoleId();
    if (roleId) {
      await this.supabase.updatePermission(roleId, docId, isChecked);
    }
  }
}
