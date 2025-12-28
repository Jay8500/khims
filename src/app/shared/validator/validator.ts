import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModel } from '@angular/forms';
@Component({
  selector: 'app-validator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validator.html',
  styleUrl: './validator.css',
})
export class Validator {
  // Pass the #name="ngModel" from your input
  @Input() control!: NgModel;
  // Pass the isSubmitted() signal from your parent component
  @Input() submitted:boolean | null | undefined = false;
  // Friendly name for the error message
  @Input() label: string = 'Field';

  get errorMessage(): string {
    const errors = this.control?.errors;
    if (!errors) return '';

    // Priority 1: Required
    if (errors['required']) return `${this.label} is required`;

    // Priority 2: Numbers/Ranges
    if (errors['min']) return `${this.label} must be at least ${errors['min'].min}`;
    if (errors['max']) return `${this.label} cannot exceed ${errors['max'].max}`;

    // Priority 3: Complex Regex Patterns
    if (errors['pattern']) {
      const pattern = errors['pattern'].requiredPattern;

      // Developer Choice: Custom messages based on regex content
      if (pattern.includes('0-9') && !pattern.includes('a-z'))
        return `Only numbers allowed for ${this.label}`;
      if (pattern.includes('a-zA-Z') && !pattern.includes('0-9'))
        return `Only letters allowed for ${this.label}`;
      if (pattern.includes('HOSP')) return `Invalid Format (Use: HOSP-0000)`;

      return `${this.label} format is invalid`;
    }

    // Priority 4: Standard Email
    if (errors['email']) return `Invalid hospital email address`;

    return 'Invalid input';
  }

  shouldShow(): boolean {
    // TRIGGER: Show if user blurs (touched) OR if Save was clicked (submitted)
    return !!(this.control?.invalid && (this.control?.touched || this.submitted));
  }
}
