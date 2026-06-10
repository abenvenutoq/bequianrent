import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerAutos } from './ver-autos';

describe('VerAutos', () => {
  let component: VerAutos;
  let fixture: ComponentFixture<VerAutos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerAutos],
    }).compileComponents();

    fixture = TestBed.createComponent(VerAutos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
