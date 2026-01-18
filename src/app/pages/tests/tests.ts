import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Supabase } from '../../services/supabase';
@Component({
  selector: 'app-tests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tests.html'
})
export class Tests implements OnInit{
  private supabase = inject(Supabase);
  
  // Signals for State
  testList = signal<any[]>([]);
  searchTerm = signal('');
  showForm = signal(false);
  selectedTest = signal<any | null>(null); // For "View Details"
  
  // Dynamic parameters for the creation form
  parameters = signal([{ parameter_name: '', unit: '', normal_range: '' }]);

  // Filtered List for the Grid
  filteredTests = computed(() => {
    return this.testList().filter(t => 
      t.test_name.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
      t.test_code?.toLowerCase().includes(this.searchTerm().toLowerCase())
    );
  });

  async ngOnInit() {
    await this.supabase.tenantReady;
    this.loadTests();
  }

  async loadTests() {
    const res = await this.supabase.getLabTests();
    if (res.statusCode === 200) this.testList.set(res.data);
  }

  addParamRow() {
    this.parameters.update(p => [...p, { parameter_name: '', unit: '', normal_range: '' }]);
  }

  removeParamRow(index: number) {
    if (this.parameters().length > 1) {
      this.parameters.update(p => p.filter((_, i) => i !== index));
    }
  }

  async submitTest(formValue: any) {
    const payload = {
      test_name: formValue.test_name,
      test_code: formValue.test_code,
      price: formValue.price,
      status: formValue.status ?? true,
      parameters: this.parameters()
    };

    const res = await this.supabase.saveLabTest(payload);
    if (res.statusCode === 200) {
      this.showForm.set(false);
      this.parameters.set([{ parameter_name: '', unit: '', normal_range: '' }]);
      this.loadTests();
    }
  }
}
