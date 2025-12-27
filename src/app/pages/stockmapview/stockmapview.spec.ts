import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stockmapview } from './stockmapview';

describe('Stockmapview', () => {
  let component: Stockmapview;
  let fixture: ComponentFixture<Stockmapview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stockmapview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stockmapview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
