import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { LeaveRequest } from './leave-request';

describe('LeaveRequest', () => {
  let component: LeaveRequest;
  let fixture: ComponentFixture<LeaveRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveRequest],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaveRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
