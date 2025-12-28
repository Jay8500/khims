import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheJay } from './the-jay';

describe('TheJay', () => {
  let component: TheJay;
  let fixture: ComponentFixture<TheJay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheJay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheJay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
