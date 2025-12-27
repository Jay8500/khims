import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Staffs } from './staffs';

describe('Staffs', () => {
  let component: Staffs;
  let fixture: ComponentFixture<Staffs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Staffs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Staffs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
