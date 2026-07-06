import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Testimonio } from './testimonios';

describe('Testimonios', () => {
  let component: Testimonio;
  let fixture: ComponentFixture<Testimonio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Testimonio],
    }).compileComponents();

    fixture = TestBed.createComponent(Testimonio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
