import { Inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser'; // Import this
@Injectable({
  providedIn: 'root',
})
export class Branding {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private titleService: Title // Inject this
  ) {}
  hospitalConfig = signal({
    name: 'HMS',
    logo: '', // Can be a Base64 string or URL
    primaryColor: '#0f172a',
    tagline: 'Precision in Healthcare',
  });

  updateBranding(newData: any) {
    this.hospitalConfig.set(newData);
    this.titleService.setTitle(newData.name);
    // THE FAVICON MAGIC
    if (newData.logo) {
      this.setDynamicFavicon(newData.logo);
    }
  }

  private setDynamicFavicon(iconUrl: string) {
    // 1. Remove any old favicons to prevent conflicts
    const existingFavicons = this.document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach((fav) => fav.remove());

    // 2. Create the new link element
    const link: HTMLLinkElement = this.document.createElement('link');

    // 3. Crucial: Use 'icon' instead of 'shortcut icon' for better PNG support
    link.rel = 'icon';

    // 4. Set the type based on the file (Base64 strings usually start with data:image/png...)
    if (iconUrl.includes('png')) {
      link.type = 'image/png';
    } else if (iconUrl.includes('jpg') || iconUrl.includes('jpeg')) {
      link.type = 'image/jpeg';
    } else {
      link.type = 'image/x-icon';
    }

    link.href = iconUrl;

    // 5. Append to Head
    this.document.getElementsByTagName('head')[0].appendChild(link);
  }
}
