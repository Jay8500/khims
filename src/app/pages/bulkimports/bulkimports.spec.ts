import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bulkimports } from './bulkimports';

describe('Bulkimports', () => {
  let component: Bulkimports;
  let fixture: ComponentFixture<Bulkimports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bulkimports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bulkimports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
