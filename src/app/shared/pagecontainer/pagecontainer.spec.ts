import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pagecontainer } from './pagecontainer';

describe('Pagecontainer', () => {
  let component: Pagecontainer;
  let fixture: ComponentFixture<Pagecontainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pagecontainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pagecontainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
