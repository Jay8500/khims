import { TestBed } from '@angular/core/testing';

import { Branding } from './branding';

describe('Branding', () => {
  let service: Branding;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Branding);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
