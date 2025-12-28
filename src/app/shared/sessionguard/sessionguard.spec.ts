import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sessionguard } from './sessionguard';

describe('Sessionguard', () => {
  let component: Sessionguard;
  let fixture: ComponentFixture<Sessionguard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sessionguard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sessionguard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
