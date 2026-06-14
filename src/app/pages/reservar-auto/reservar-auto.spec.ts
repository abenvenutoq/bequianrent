import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarAuto } from './reservar-auto';

describe('ReservarAuto', () => {
  let component: ReservarAuto;
  let fixture: ComponentFixture<ReservarAuto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservarAuto],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservarAuto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
