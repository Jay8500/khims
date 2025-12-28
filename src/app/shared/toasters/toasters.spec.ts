import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Toasters } from './toasters';

describe('Toasters', () => {
  let component: Toasters;
  let fixture: ComponentFixture<Toasters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toasters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Toasters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
