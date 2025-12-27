import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Laborartory } from './laborartory';

describe('Laborartory', () => {
  let component: Laborartory;
  let fixture: ComponentFixture<Laborartory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Laborartory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Laborartory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
