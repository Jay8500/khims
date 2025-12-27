import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Admincalendar } from './admincalendar';

describe('Admincalendar', () => {
  let component: Admincalendar;
  let fixture: ComponentFixture<Admincalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admincalendar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Admincalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
