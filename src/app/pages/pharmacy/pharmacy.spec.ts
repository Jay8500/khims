import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pharmacy } from './pharmacy';

describe('Pharmacy', () => {
  let component: Pharmacy;
  let fixture: ComponentFixture<Pharmacy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pharmacy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pharmacy);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
