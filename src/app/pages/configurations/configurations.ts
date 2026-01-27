import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Branding } from '../../services/branding';
@Component({
  selector: 'app-configurations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configurations.html'
})
export class Configurations {
  public branding = inject(Branding);
  previewLogo = signal<string>(this.branding.hospitalConfig().logo);

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // This converts the image to a string
        this.previewLogo.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }
  applyChanges(data: any) {
    // 1. In the real world, we save to Supabase here
    console.log('Pushing to SaaS Master Config:', data);

    // 2. We trigger a Toast or Success message
    alert(`Branding updated for ${data.name}!`);

    // 3. Optional: Logic to update the local session branding
    document.documentElement.style.setProperty('--primary-hosp', data.primaryColor);
  }

  saveConfig(formValue: any) {
    const updatedData = {
      ...formValue,
      logo: this.previewLogo(), // Save the stringified image
    };
    this.branding.updateBranding(updatedData);
    alert('Branding Live! Check your header.');
  }
}
