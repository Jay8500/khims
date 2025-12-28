import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Validator } from './validator';

describe('Validator', () => {
  let component: Validator;
  let fixture: ComponentFixture<Validator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Validator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Validator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
